-- Create gamification tables
CREATE TABLE public.user_levels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  level INTEGER NOT NULL DEFAULT 1,
  experience_points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

CREATE TABLE public.badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  requirement_type TEXT NOT NULL, -- 'articles_count', 'views_count', 'likes_count', etc.
  requirement_value INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.user_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  task_type TEXT NOT NULL, -- 'publish_article', 'get_likes', 'get_followers', etc.
  target_value INTEGER NOT NULL,
  reward_experience INTEGER NOT NULL DEFAULT 0,
  reward_badge_id UUID REFERENCES public.badges(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.user_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  current_progress INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, task_id)
);

-- Enable RLS
ALTER TABLE public.user_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tasks ENABLE ROW LEVEL SECURITY;

-- Policies for user_levels
CREATE POLICY "Users can view their own level" ON public.user_levels FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own level" ON public.user_levels FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own level" ON public.user_levels FOR UPDATE USING (auth.uid() = user_id);

-- Policies for badges (publicly viewable)
CREATE POLICY "Badges are viewable by everyone" ON public.badges FOR SELECT USING (true);

-- Policies for user_badges
CREATE POLICY "Users can view their own badges" ON public.user_badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own badges" ON public.user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies for tasks (publicly viewable)
CREATE POLICY "Tasks are viewable by everyone" ON public.tasks FOR SELECT USING (true);

-- Policies for user_tasks
CREATE POLICY "Users can view their own tasks" ON public.user_tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own tasks" ON public.user_tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own tasks" ON public.user_tasks FOR UPDATE USING (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_user_levels_updated_at BEFORE UPDATE ON public.user_levels FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_tasks_updated_at BEFORE UPDATE ON public.user_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to calculate user level from experience
CREATE OR REPLACE FUNCTION public.calculate_level_from_experience(experience INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Level formula: level = floor(sqrt(experience / 100)) + 1
  RETURN GREATEST(1, FLOOR(SQRT(experience / 100.0)) + 1);
END;
$$;

-- Function to update user level and check badges
CREATE OR REPLACE FUNCTION public.update_user_gamification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_exp INTEGER;
  new_level INTEGER;
  article_count INTEGER;
  total_views INTEGER;
  total_likes INTEGER;
  followers_count INTEGER;
BEGIN
  -- Get current user stats
  SELECT articles_count, followers_count INTO article_count, followers_count
  FROM public.profiles 
  WHERE user_id = NEW.author_id;

  -- Calculate total views and likes
  SELECT 
    COALESCE(SUM(views_count), 0),
    COALESCE(SUM(likes_count), 0)
  INTO total_views, total_likes
  FROM public.articles 
  WHERE author_id = NEW.author_id AND is_published = true;

  -- Calculate experience points
  current_exp := (article_count * 50) + (total_views * 2) + (total_likes * 10) + (followers_count * 20);
  new_level := public.calculate_level_from_experience(current_exp);

  -- Insert or update user level
  INSERT INTO public.user_levels (user_id, level, experience_points)
  VALUES (NEW.author_id, new_level, current_exp)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    level = new_level,
    experience_points = current_exp,
    updated_at = now();

  RETURN NEW;
END;
$$;

-- Trigger to update gamification when articles are published
CREATE TRIGGER update_gamification_on_article_publish
  AFTER INSERT OR UPDATE ON public.articles
  FOR EACH ROW
  WHEN (NEW.is_published = true)
  EXECUTE FUNCTION public.update_user_gamification();

-- Insert default badges
INSERT INTO public.badges (name, description, icon, requirement_type, requirement_value) VALUES
('First Page', 'Published your first page', 'Star', 'articles_count', 1),
('Prolific Writer', 'Published 5 pages', 'Trophy', 'articles_count', 5),
('Content Master', 'Published 10 pages', 'Award', 'articles_count', 10),
('Viral Content', 'Got 1000+ views total', 'Eye', 'views_count', 1000),
('Popular Author', 'Got 100+ likes total', 'Heart', 'likes_count', 100),
('Loved Creator', 'Got 500+ likes total', 'Heart', 'likes_count', 500),
('Influencer', 'Have 50+ followers', 'Users', 'followers_count', 50),
('Expert Level', 'Reached level 10', 'Award', 'level', 10);

-- Insert default tasks
INSERT INTO public.tasks (title, description, task_type, target_value, reward_experience) VALUES
('Publish Your First Page', 'Share your knowledge with the world by publishing your first page', 'publish_article', 1, 100),
('Get Your First Like', 'Create engaging content that receives its first like', 'get_likes', 1, 25),
('Gain 5 Followers', 'Build your audience by gaining 5 followers', 'get_followers', 5, 150),
('Publish 3 Pages', 'Keep creating content by publishing 3 pages', 'publish_article', 3, 200),
('Get 100 Views', 'Create content that attracts 100+ total views', 'get_views', 100, 100);