
-- Site settings table (key-value store for admin settings)
CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL DEFAULT '{}',
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read settings (needed for maintenance check)
CREATE POLICY "Anyone can read settings" ON public.site_settings
  FOR SELECT TO anon, authenticated USING (true);

-- Only admins can update
CREATE POLICY "Admins can update settings" ON public.site_settings
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert settings" ON public.site_settings
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete settings" ON public.site_settings
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Insert default settings
INSERT INTO public.site_settings (key, value) VALUES
  ('maintenance_mode', '{"enabled": false, "message": "Sedang dalam pemeliharaan. Silakan kembali nanti."}'),
  ('subscription_price', '{"amount": 20000, "currency": "IDR", "duration_days": 30}'),
  ('rate_limit', '{"requests_per_minute": 60}'),
  ('site_info', '{"name": "DramaKu", "description": "Platform streaming drama terbaik", "announcement": ""}'),
  ('registration', '{"enabled": true, "gmail_only": true}');
