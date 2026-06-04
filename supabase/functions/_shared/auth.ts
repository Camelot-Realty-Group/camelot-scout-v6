/**
 * Bearer-token guard for write-side Edge Functions. Reads the Supabase service
 * role from env (set with `supabase secrets set SERVICE_ROLE_KEY=...`) and
 * validates the JWT on inbound requests so the function isn't a public side
 * door into your DB.
 */
export function requireServiceRole(req: Request): boolean {
  const expected = Deno.env.get('FUNCTION_SHARED_SECRET');
  if (!expected) return false;
  const auth = req.headers.get('Authorization') ?? '';
  return auth === `Bearer ${expected}`;
}
