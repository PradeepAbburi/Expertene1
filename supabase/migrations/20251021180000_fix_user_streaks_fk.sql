-- Fix user_streaks foreign key to reference profiles.id
ALTER TABLE public.user_streaks DROP CONSTRAINT IF EXISTS user_streaks_user_id_fkey;
ALTER TABLE public.user_streaks ADD CONSTRAINT user_streaks_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
-- Optionally, update existing user_streaks rows to match profiles.id if needed
-- UPDATE public.user_streaks SET user_id = (SELECT id FROM profiles WHERE profiles.user_id = public.user_streaks.user_id) WHERE EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = public.user_streaks.user_id);
