import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3.23.8';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
// Default sender — override per-call by passing `from`. Use a verified Resend
// domain in production; `onboarding@resend.dev` works for testing only.
const DEFAULT_FROM = Deno.env.get('RESEND_FROM') ?? 'NAFT Notify <onboarding@resend.dev>';

const BodySchema = z.object({
  to: z.union([z.string().email(), z.array(z.string().email()).min(1)]),
  subject: z.string().min(1).max(200),
  html: z.string().min(1).optional(),
  text: z.string().min(1).optional(),
  template: z.enum(['welcome', 'generic']).optional(),
  data: z.record(z.any()).optional(),
  from: z.string().optional(),
  reply_to: z.string().email().optional(),
}).refine((b) => b.html || b.text || b.template, {
  message: 'Provide html, text, or template',
});

const renderWelcome = (data: Record<string, any> = {}) => {
  const name = (data.name as string) || 'Trader';
  return {
    subject: `Welcome to NAFT, ${name}`,
    html: `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#ffffff;font-family:'DM Sans',Arial,sans-serif;color:#0f0f10">
<div style="max-width:560px;margin:0 auto;padding:32px 24px">
  <div style="font-family:'Barlow Condensed',Arial,sans-serif;font-weight:800;font-size:28px;letter-spacing:0.5px;color:#0f0f10;margin-bottom:8px">
    NOT A FUGAZI <span style="color:#bef264">TRADER</span>
  </div>
  <h1 style="font-family:'Barlow Condensed',Arial,sans-serif;font-size:32px;font-weight:800;margin:24px 0 12px;color:#0f0f10">
    Welcome aboard, ${name}.
  </h1>
  <p style="font-size:15px;line-height:1.6;color:#3f3f46;margin:0 0 16px">
    You've joined the community that fights back against fugazi brokers. Real reviews, real scam alerts, real signals — no shilling.
  </p>
  <p style="font-size:15px;line-height:1.6;color:#3f3f46;margin:0 0 24px">
    Get started by exploring brokers, checking scam alerts, or filing your first review.
  </p>
  <a href="https://fugazi.lovable.app/dashboard"
     style="display:inline-block;background:#bef264;color:#0f0f10;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;letter-spacing:0.3px">
    Open your dashboard
  </a>
  <hr style="border:none;border-top:1px solid #e4e4e7;margin:32px 0" />
  <p style="font-size:12px;color:#71717a;line-height:1.5;margin:0">
    NAFT — Not A Fugazi Trader · Independent broker reviews · You're receiving this because you signed up at fugazi.lovable.app
  </p>
</div></body></html>`,
  };
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  if (!RESEND_API_KEY) {
    return new Response(JSON.stringify({ error: 'RESEND_API_KEY not configured' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten() }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const body = parsed.data;

    let { subject, html, text } = body;
    if (body.template === 'welcome') {
      const r = renderWelcome(body.data);
      subject = subject || r.subject;
      html = html || r.html;
    }

    const payload = {
      from: body.from || DEFAULT_FROM,
      to: Array.isArray(body.to) ? body.to : [body.to],
      subject,
      ...(html ? { html } : {}),
      ...(text ? { text } : {}),
      ...(body.reply_to ? { reply_to: body.reply_to } : {}),
    };

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      console.error('Resend error', res.status, data);
      return new Response(JSON.stringify({ error: data }), {
        status: res.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ success: true, id: data.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    console.error('send-email error', msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
