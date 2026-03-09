
CREATE OR REPLACE FUNCTION public.admin_grant_subscription(_user_id uuid, _days integer default 30)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, invoice_id, status, amount, payment_method, starts_at, expires_at, paid_at)
  VALUES (
    _user_id,
    'ADMIN-GRANT-' || gen_random_uuid()::text,
    'active',
    20000,
    'manual',
    now(),
    now() + (_days || ' days')::interval,
    now()
  );
END;
$$;

SELECT public.admin_grant_subscription('df5b96af-fdde-4166-90b5-ee10942fd550', 30);
