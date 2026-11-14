-- Accessibility Monitor (monthly subscription): schema for the weekly re-check and the history view.
-- Applied to Supabase project otkvebgrdiayjnqrytrn as migrations a11y_monitor_tables, a11y_monitor_functions,
-- a11y_monitor_lockdown, a11y_monitor_key_clear and a11y_monitor_cron.
-- Additive only: CREATE ... IF NOT EXISTS / CREATE OR REPLACE, no DROP.
--
-- What is stored, and why:
--   a11y_monitors: one row per monitor license (SHA-256 hash of the key), its domain and the one
--     page it watches (origin + path, no query string), plus scheduling state. No names, no emails.
--   a11y_history: per (key_hash, domain) only the check date, score, counts (per severity and per
--     check id) and engine version. No page content, no personal data.
--   Vault secret "a11y_mon:<key_hash>": the license key itself, encrypted by Supabase Vault, only so
--     the weekly job can ask Gumroad whether the subscription is still active. Overwritten with ''
--     (a11y_mon_key_clear) as soon as the subscription has ended.
-- Retention (done by the edge function on each cron run, via REST): history of an ended subscription
--   is deleted 90 days after the end, together with its monitor row; any history row after 400 days.
--   Vault secret "a11y_cron_secret": random token that the hourly pg_cron call must present.

-- config keys (empty until the Gumroad membership product exists)
INSERT INTO public.a11y_config(key, value) VALUES ('gumroad_monitor_product_id', ''), ('monitor_buy_url', '')
ON CONFLICT (key) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.a11y_monitors (
  key_hash text PRIMARY KEY CHECK (key_hash ~ '^[0-9a-f]{64}$'),
  domain text NOT NULL CHECK (length(domain) <= 253),
  page_url text NOT NULL CHECK (length(page_url) <= 2048),
  active boolean NOT NULL DEFAULT true,
  next_check_at timestamptz NOT NULL DEFAULT now() + interval '7 days',
  last_auto_at timestamptz,
  last_auto_status text CHECK (last_auto_status IS NULL OR length(last_auto_status) <= 40),
  created_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz
);
ALTER TABLE public.a11y_monitors ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS a11y_monitors_due ON public.a11y_monitors (next_check_at) WHERE active;

CREATE TABLE IF NOT EXISTS public.a11y_history (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  key_hash text NOT NULL CHECK (key_hash ~ '^[0-9a-f]{64}$'),
  domain text NOT NULL CHECK (length(domain) <= 253),
  checked_at timestamptz NOT NULL DEFAULT now(),
  score integer CHECK (score IS NULL OR score BETWEEN 0 AND 100),
  counts jsonb NOT NULL DEFAULT '{}'::jsonb,
  check_counts jsonb NOT NULL DEFAULT '{}'::jsonb,
  engine text NOT NULL CHECK (length(engine) <= 20),
  auto boolean NOT NULL DEFAULT false
);
ALTER TABLE public.a11y_history ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS a11y_history_kd ON public.a11y_history (key_hash, domain, checked_at DESC);

-- RLS is on with no policies; also remove the default grants so anon/authenticated have nothing.
REVOKE ALL ON public.a11y_monitors FROM anon, authenticated;
REVOKE ALL ON public.a11y_history FROM anon, authenticated;

-- cron token (created once)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM vault.secrets WHERE name = 'a11y_cron_secret') THEN
    PERFORM vault.create_secret(encode(extensions.gen_random_bytes(32), 'hex'), 'a11y_cron_secret', 'a11y-scan /cron token (pg_cron -> edge function)');
  END IF;
END $$;

-- service_role only: check the token the cron call presents (compares digests)
CREATE OR REPLACE FUNCTION public.a11y_cron_ok(p_token text) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT coalesce(length(p_token) >= 32 AND (
    SELECT extensions.digest(s.decrypted_secret, 'sha256') = extensions.digest(p_token, 'sha256')
    FROM vault.decrypted_secrets s WHERE s.name = 'a11y_cron_secret'
  ), false);
$$;

-- service_role only: store / read / delete a monitor license key in Vault
CREATE OR REPLACE FUNCTION public.a11y_mon_key_put(p_key_hash text, p_key text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE sid uuid;
BEGIN
  IF p_key_hash !~ '^[0-9a-f]{64}$' OR p_key !~ '^[A-Za-z0-9-]{1,100}$' THEN RAISE EXCEPTION 'bad input'; END IF;
  SELECT id INTO sid FROM vault.secrets WHERE name = 'a11y_mon:' || p_key_hash;
  IF sid IS NULL THEN
    PERFORM vault.create_secret(p_key, 'a11y_mon:' || p_key_hash, 'a11y monitor license key');
  ELSE
    PERFORM vault.update_secret(sid, p_key);
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.a11y_mon_key_get(p_key_hash text) RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT s.decrypted_secret FROM vault.decrypted_secrets s WHERE s.name = 'a11y_mon:' || p_key_hash LIMIT 1;
$$;

-- service_role only: forget a stored key (subscription ended)
CREATE OR REPLACE FUNCTION public.a11y_mon_key_clear(p_key_hash text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE sid uuid;
BEGIN
  IF p_key_hash !~ '^[0-9a-f]{64}$' THEN RAISE EXCEPTION 'bad input'; END IF;
  SELECT id INTO sid FROM vault.secrets WHERE name = 'a11y_mon:' || p_key_hash;
  IF sid IS NOT NULL THEN PERFORM vault.update_secret(sid, ''); END IF;
END $$;

REVOKE ALL ON FUNCTION public.a11y_cron_ok(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.a11y_mon_key_put(text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.a11y_mon_key_get(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.a11y_mon_key_clear(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.a11y_cron_ok(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.a11y_mon_key_put(text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.a11y_mon_key_get(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.a11y_mon_key_clear(text) TO service_role;

-- hourly tick: the function re-checks monitors that are due (each one weekly), a few per run.
-- cron.schedule with an existing job name updates that job.
SELECT cron.schedule('a11y-monitor-tick', '23 * * * *', $cron$
  SELECT net.http_post(
    url := 'https://otkvebgrdiayjnqrytrn.supabase.co/functions/v1/a11y-scan/cron',
    body := '{}'::jsonb,
    headers := jsonb_build_object('content-type', 'application/json',
      'x-a11y-cron', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'a11y_cron_secret')),
    timeout_milliseconds := 10000)
$cron$);
