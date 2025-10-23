-- Update profiles table to ensure username is unique and not nullable
ALTER TABLE public.profiles 
ALTER COLUMN username SET NOT NULL;

-- Add unique constraint on username
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_username_unique UNIQUE (username);

-- Add unique constraints to prevent multiple likes/bookmarks from same user
ALTER TABLE public.likes
ADD CONSTRAINT likes_user_article_unique UNIQUE (user_id, article_id);

ALTER TABLE public.bookmarks
ADD CONSTRAINT bookmarks_user_article_unique UNIQUE (user_id, article_id);

-- Update handle_new_user function to properly extract username from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;