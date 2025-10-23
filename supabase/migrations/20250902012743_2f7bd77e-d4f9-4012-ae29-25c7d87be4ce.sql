-- Add comment count column to articles table
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS comments_count integer DEFAULT 0;

-- Create function to update comment counts
CREATE OR REPLACE FUNCTION public.update_comment_counts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Update comments count
    UPDATE public.articles 
    SET comments_count = comments_count + 1 
    WHERE id = NEW.article_id;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Update comments count
    UPDATE public.articles 
    SET comments_count = comments_count - 1 
    WHERE id = OLD.article_id;
    
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger for comment counting
DROP TRIGGER IF EXISTS update_article_comment_counts ON public.comments;
CREATE TRIGGER update_article_comment_counts
  AFTER INSERT OR DELETE ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_comment_counts();

-- Update existing comment counts
UPDATE public.articles 
SET comments_count = (
  SELECT COUNT(*) 
  FROM public.comments 
  WHERE comments.article_id = articles.id
);

-- Create function to properly update view counts
CREATE OR REPLACE FUNCTION public.increment_article_views(article_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.articles 
  SET views_count = views_count + 1 
  WHERE id = article_id_param AND is_published = true;
END;
$$;