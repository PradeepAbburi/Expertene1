-- Create announcements table for site-wide announcements
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID NOT NULL,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active announcements
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_policies 
    WHERE policyname = 'Anyone can view active announcements'
      AND tablename = 'announcements'
  ) THEN
    CREATE POLICY "Anyone can view active announcements"
      ON public.announcements
      FOR SELECT
      USING (is_active = true);
  END IF;
END
$$;

-- Policy: Admins can read all announcements
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE policyname = 'Admins can view all announcements'
      AND tablename = 'announcements'
  ) THEN
    CREATE POLICY "Admins can view all announcements"
      ON public.announcements
      FOR SELECT
      USING (true);
  END IF;
END
$$;

-- Policy: Only admins can insert announcements
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE policyname = 'Admins can create announcements'
      AND tablename = 'announcements'
  ) THEN
    CREATE POLICY "Admins can create announcements"
      ON public.announcements
      FOR INSERT
      WITH CHECK (true);
  END IF;
END
$$;

-- Policy: Only admins can update announcements
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE policyname = 'Admins can update announcements'
      AND tablename = 'announcements'
  ) THEN
    CREATE POLICY "Admins can update announcements"
      ON public.announcements
      FOR UPDATE
      USING (true);
  END IF;
END
$$;

-- Policy: Only admins can delete announcements
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE policyname = 'Admins can delete announcements'
      AND tablename = 'announcements'
  ) THEN
    CREATE POLICY "Admins can delete announcements"
      ON public.announcements
      FOR DELETE
      USING (true);
  END IF;
END
$$;

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_announcements_active ON public.announcements(is_active);
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON public.announcements(created_at DESC);

-- Add update trigger for updated_at
CREATE OR REPLACE FUNCTION update_announcements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_announcements_updated_at_trigger ON announcements;

CREATE TRIGGER update_announcements_updated_at_trigger
BEFORE UPDATE ON announcements
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
