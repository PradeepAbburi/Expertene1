-- Ensure client can write announcements when using anon/authenticated role
-- Grants are required in addition to RLS policies for PostgREST roles

DO $$ BEGIN
  -- Grant basic CRUD to both anon and authenticated (UI gates access)
  EXECUTE 'GRANT SELECT ON TABLE public.announcements TO anon, authenticated';
  EXECUTE 'GRANT INSERT ON TABLE public.announcements TO anon, authenticated';
  EXECUTE 'GRANT UPDATE ON TABLE public.announcements TO anon, authenticated';
  EXECUTE 'GRANT DELETE ON TABLE public.announcements TO anon, authenticated';
EXCEPTION WHEN undefined_table THEN
  -- Table not present yet; skip grants
  RAISE NOTICE 'Table public.announcements not found; run the create_announcements_table migration first.';
END $$;