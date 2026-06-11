-- Restore EXECUTE on has_role for authenticated role so RLS policies that
-- reference has_role() can run during PostgREST queries.
-- We keep it revoked from PUBLIC and anon to prevent role-probing via RPC.
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;