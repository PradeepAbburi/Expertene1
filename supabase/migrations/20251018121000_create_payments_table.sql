-- Payments table for recording revenue
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL CHECK (status IN ('succeeded','pending','failed','refunded','canceled')),
  provider TEXT, -- e.g., stripe, razorpay
  provider_payment_id TEXT, -- external reference id
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Placeholder permissive policies (tighten later to admin-only)
CREATE POLICY "Admins can view payments" ON public.payments FOR SELECT USING (true);
CREATE POLICY "Admins can insert payments" ON public.payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update payments" ON public.payments FOR UPDATE USING (true);
CREATE POLICY "Admins can delete payments" ON public.payments FOR DELETE USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON public.payments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_user ON public.payments(user_id);

-- Trigger to maintain updated_at
CREATE OR REPLACE FUNCTION update_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_payments_updated_at_trigger ON public.payments;
CREATE TRIGGER update_payments_updated_at_trigger
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION update_payments_updated_at();