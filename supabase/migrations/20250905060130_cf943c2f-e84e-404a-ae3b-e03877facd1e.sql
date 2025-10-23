-- Add privacy settings to articles table
ALTER TABLE public.articles ADD COLUMN is_private boolean DEFAULT false;

-- Update RLS policies for private articles
DROP POLICY IF EXISTS "Published articles are viewable by everyone" ON public.articles;

-- New policy for public published articles
CREATE POLICY "Public published articles are viewable by everyone" 
ON public.articles 
FOR SELECT 
USING (is_published = true AND is_private = false);

-- New policy for private articles viewable by link
CREATE POLICY "Private articles are viewable by direct link" 
ON public.articles 
FOR SELECT 
USING (is_published = true AND is_private = true);

-- Policy for authors to view their own articles
CREATE POLICY "Authors can view their own articles" 
ON public.articles 
FOR SELECT 
USING (auth.uid() = author_id);