import { createClient } from '@supabase/supabase-js';
import { connect } from 'https://deno.land/x/smtp/mod.ts';
import { v4 } from 'https://deno.land/std@0.203.0/uuid/mod.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE')!;
const GMAIL_USER = Deno.env.get('GMAIL_USER')!;
const GMAIL_APP_PASSWORD = Deno.env.get('GMAIL_APP_PASSWORD')!;
const RESET_TOKEN_TTL_SECONDS = Number(Deno.env.get('RESET_TOKEN_TTL_SECONDS') || '3600');
const RESET_LINK_BASE = Deno.env.get('RESET_LINK_BASE') || ''; // e.g. https://app.example.com/reset-password
const RESET_RATE_LIMIT_WINDOW = Number(Deno.env.get('RESET_RATE_LIMIT_WINDOW') || '3600'); // seconds
const RESET_RATE_LIMIT_MAX = Number(Deno.env.get('RESET_RATE_LIMIT_MAX') || '3');

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
    const email = (body.email || '').toString().trim().toLowerCase();
    if (!email) return new Response(JSON.stringify({ error: 'email required' }), { status: 400 });

    // rate limit: don't send more than RESET_RATE_LIMIT_MAX links within the window
    const since = new Date(Date.now() - RESET_RATE_LIMIT_WINDOW * 1000).toISOString();
    const { data: recent, error: recentErr } = await supabase.from('password_reset_tokens').select('token', { count: 'exact' }).eq('email', email).gte('created_at', since);
    if (recentErr) {
      console.error('recentErr', recentErr);
      return new Response(JSON.stringify({ error: 'db_error' }), { status: 500, headers: CORS_HEADERS });
    }
    const recentCount = (recent as any)?.length ?? 0;
    if (recentCount >= RESET_RATE_LIMIT_MAX) {
      // respond 200 to avoid account enumeration, but do not send email
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: CORS_HEADERS });
    }

    // create reset token and insert
    const resetToken = v4.generate();
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_SECONDS * 1000).toISOString();
    const { error: insertErr } = await supabase.from('password_reset_tokens').insert([{ token: resetToken, email, expires_at: expiresAt }]);
    if (insertErr) {
      console.error('insertErr', insertErr);
      return new Response(JSON.stringify({ error: 'db_insert_failed' }), { status: 500, headers: CORS_HEADERS });
    }

    // send email with HTML link
    const client = await connect({ hostname: 'smtp.gmail.com', port: 587, username: GMAIL_USER, password: GMAIL_APP_PASSWORD });
    const from = `${Deno.env.get('OTP_FROM_NAME') || 'No Reply'} <${Deno.env.get('OTP_FROM_EMAIL') || GMAIL_USER}>`;
    const subject = Deno.env.get('RESET_LINK_SUBJECT') || 'Reset your password';
    const link = RESET_LINK_BASE ? `${RESET_LINK_BASE}?token=${resetToken}` : `?token=${resetToken}`;
    const html = `
      <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.4;color:#111">
        <h2 style="color:#0b63ce">Reset your password</h2>
        <p>Click the button below to reset your password. This link will expire in ${Math.floor(RESET_TOKEN_TTL_SECONDS / 60)} minutes.</p>
        <p><a href="${link}" style="display:inline-block;padding:12px 20px;background:#0b63ce;color:#fff;border-radius:6px;text-decoration:none">Reset Password</a></p>
        <p style="color:#666">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `;

    await client.send({ from, to: email, subject, html, content: `Reset link: ${link}` });
    client.close();
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: CORS_HEADERS });
  } catch (err) {
    console.error('send-reset-link error', err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: (typeof CORS_HEADERS !== 'undefined' ? CORS_HEADERS : {}) });
  }
};
