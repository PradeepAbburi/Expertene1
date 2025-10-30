import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

export default async (req: Request) => {
  const CORS_HEADERS = {
    'Access-Control-Allow-Origin': Deno.env.get('RESET_LINK_BASE') || '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  };
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS_HEADERS });
  try {
    if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'method_not_allowed' }), { status: 405, headers: CORS_HEADERS });
    const body = await req.json();
    const token = (body.token || '').toString();
    const newPassword = (body.new_password || '').toString();
    if (!token || !newPassword) return new Response(JSON.stringify({ error: 'token and new_password required' }), { status: 400 });

    const { data: rows, error: fetchErr } = await supabase.from('password_reset_tokens').select('*').eq('token', token).limit(1).maybeSingle();
    if (fetchErr) {
      console.error('fetchErr', fetchErr);
      return new Response(JSON.stringify({ error: 'db_error' }), { status: 500, headers: CORS_HEADERS });
    }
    if (!rows) return new Response(JSON.stringify({ error: 'invalid_token' }), { status: 400, headers: CORS_HEADERS });

    const now = new Date();
  if (new Date(rows.expires_at) < now || rows.used) return new Response(JSON.stringify({ error: 'token_expired_or_used' }), { status: 400, headers: CORS_HEADERS });

    const email = rows.email;

    // Find user by email using admin REST endpoint
    const adminUrl = `${SUPABASE_URL}/auth/v1/admin/users?email=${encodeURIComponent(email)}`;
    const res = await fetch(adminUrl, { headers: { Authorization: `Bearer ${SUPABASE_SERVICE_ROLE}` } });
    if (!res.ok) {
      console.error('admin user fetch failed', await res.text());
      return new Response(JSON.stringify({ error: 'user_lookup_failed' }), { status: 500 });
    }
    const users = await res.json();
    const user = Array.isArray(users) ? users[0] : users;
    if (!user || !user.id) return new Response(JSON.stringify({ error: 'user_not_found' }), { status: 400 });

    // Update password via admin endpoint
    const updateUrl = `${SUPABASE_URL}/auth/v1/admin/users/${user.id}`;
    const updateRes = await fetch(updateUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${SUPABASE_SERVICE_ROLE}` },
      body: JSON.stringify({ password: newPassword }),
    });
    if (!updateRes.ok) {
      console.error('updateRes failed', await updateRes.text());
      return new Response(JSON.stringify({ error: 'password_update_failed' }), { status: 500, headers: CORS_HEADERS });
    }

    // mark token used
    await supabase.from('password_reset_tokens').update({ used: true }).eq('token', token);
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: CORS_HEADERS });
  } catch (err) {
    console.error('complete-reset error', err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: (typeof CORS_HEADERS !== 'undefined' ? CORS_HEADERS : {}) });
  }
};
