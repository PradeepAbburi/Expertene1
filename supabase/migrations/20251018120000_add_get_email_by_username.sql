-- Create an RPC to resolve username -> email for sign-in
CREATE OR REPLACE FUNCTION public.get_email_by_username(p_username text)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT au.email
  FROM auth.users au
  JOIN public.profiles p ON p.user_id = au.id
  WHERE lower(p.username) = lower(p_username)
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_email_by_username(text) TO anon, authenticated;