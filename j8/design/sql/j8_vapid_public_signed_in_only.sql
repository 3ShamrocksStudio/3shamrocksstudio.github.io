-- r-1125-03 (28 Nov 2026), applied as migration j8_vapid_public_signed_in_only.
-- The web-push public key is only read during push setup, which runs signed in.
revoke execute on function public.j8_vapid_public() from public, anon;
grant execute on function public.j8_vapid_public() to authenticated, service_role;
-- Rollback:
-- grant execute on function public.j8_vapid_public() to anon;
