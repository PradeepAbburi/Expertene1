-- Add collaboration features
CREATE TABLE public.page_collaborators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  permission TEXT NOT NULL CHECK (permission IN ('view', 'comment', 'edit')),
  invited_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(page_id, user_email)
);

-- Add sharing settings to articles
ALTER TABLE public.articles ADD COLUMN share_token TEXT UNIQUE;
ALTER TABLE public.articles ADD COLUMN allow_comments BOOLEAN DEFAULT true;

-- Enable RLS on collaborators
ALTER TABLE public.page_collaborators ENABLE ROW LEVEL SECURITY;

-- Policies for collaborators
CREATE POLICY "Page authors can manage collaborators" 
ON public.page_collaborators 
FOR ALL
USING (EXISTS (
  SELECT 1 FROM articles 
  WHERE articles.id = page_collaborators.page_id 
  AND auth.uid() = articles.author_id
));

CREATE POLICY "Collaborators can view their own access" 
ON public.page_collaborators 
FOR SELECT
USING (user_email = auth.email());

-- Update articles policies for sharing
CREATE POLICY "Shared pages are accessible via token" 
ON public.articles 
FOR SELECT
USING (share_token IS NOT NULL);

-- Function to generate share token
CREATE OR REPLACE FUNCTION public.generate_share_token()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN encode(gen_random_bytes(16), 'base64url');
END;
$$;