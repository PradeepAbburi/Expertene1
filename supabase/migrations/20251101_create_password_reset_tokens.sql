-- Create table to store single-use password reset tokens issued after OTP verification
CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
  token uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text NOT NULL,
  expires_at timestamptz NOT NULL,
  used boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_email ON public.password_reset_tokens (email);
        