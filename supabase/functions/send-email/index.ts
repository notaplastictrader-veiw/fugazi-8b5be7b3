import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@3.23.8';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const DEFAULT_FROM = Deno.env.get('RESEND_FROM') ?? 'NAFT Notify <onboarding@resend.dev>';
const SITE_URL = 'https://fugazi.lovable.app';

type Theme = 'dark' | 'light' | 'sentinel';

const PALETTES: Record<Theme, {
  bg: string; card: string; text: string; muted: string;
  accent: string; accentText: string; border: string;
  eyebrow: string; danger: string; success: string;
}> = {
  dark: {
    bg: '#0a0a0b', card: '#18181b', text: '#fafafa', muted: '#a1a1aa',
    accent: '#bef264', accentText: '#0f0f10', border: '#27272a',
    eyebrow: '#bef264', danger: '#ef4444', success: '#84cc16',
  },
  light: {
    bg: '#fafaf7', card: '#ffffff', text: '#0f0f10', muted: '#52525b',
    accent: '#16a34a', accentText: '#ffffff', border: '#e4e4e7',
    eyebrow: '#15803d', danger: '#dc2626', success: '#16a34a',
  },
  sentinel: {
    bg: '#0a1a24', card: '#102935', text: '#e6eef2', muted: '#7a96a4',
    accent: '#e63329', accentText: '#ffffff', border: '#1e3a47',
    eyebrow: '#2bb8a8', danger: '#e63329', success: '#2bb8a8',
  },
};

const HEADING_FONT = "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif";
const BODY_FONT = "'DM Sans', -apple-system, Arial, sans-serif";

const BodySchema = z.object({
  to: z.union([z.string().email(), z.array(z.string().email()).min(1)]),
  subject: z.string().min(1).max(200).optional(),
  template: z.enum([
    'welcome', 'verify', 'reset', 'scam_alert',
    'review_approved', 'premium_signal', 'complaint_update', 'referral',
    'generic',
  ]),
  data: z.record(z.any()).optional(),
  theme: z.enum(['dark', 'light', 'sentinel']).optional(),
  from: z.string().optional(),
  reply_to: z.string().email().optional(),
});

// Look up theme preference from profile by email
async function resolveTheme(email: string, override?: Theme): Promise<Theme> {
  if (override) return override;
  try {
    const sb = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: u } = await sb.auth.admin.listUsers();
    const user = u?.users?.find((x: any) => x.email?.toLowerCase() === email.toLowerCase());
    if (!user) return 'dark';
    const { data: p } = await sb
      .from('profiles')
      .select('theme_preference')
      .eq('user_id', user.id)
      .maybeSingle();
    return (p?.theme_preference as Theme) || 'dark';
  } catch {
    return 'dark';
  }
}

// Risk & Liability Disclaimer — appended to every email
function disclaimerFooter(p: typeof PALETTES.dark) {
  return `
  <div style="margin-top:32px;padding-top:20px;border-top:1px solid ${p.border}">
    <p style="font-size:11px;line-height:1.6;color:${p.muted};margin:0 0 10px;font-family:${BODY_FONT}">
      <strong style="color:${p.text};text-transform:uppercase;letter-spacing:0.5px;font-size:10px">Risk &amp; Liability Disclaimer</strong><br/>
      NAFT (Not A Fugazi Trader) is an independent information &amp; review platform. We are not a broker, financial advisor, signal provider, or bookmaker.
      All content is for informational and educational purposes only and does not constitute financial, investment, or legal advice.
      Trading FX, CFDs, crypto and other leveraged instruments carries a high level of risk and may result in the loss of all invested capital.
      Past performance is never a guarantee of future results. Sports / betting content is provided for entertainment purposes only.
      NAFT accepts no liability for any direct, indirect, or consequential loss arising from reliance on information featured here.
    </p>
    <p style="font-size:11px;color:${p.muted};margin:0;font-family:${BODY_FONT}">
      <a href="${SITE_URL}/disclaimer" style="color:${p.accent};text-decoration:none">Full disclaimer</a> ·
      <a href="${SITE_URL}/terms" style="color:${p.accent};text-decoration:none">Terms</a> ·
      <a href="${SITE_URL}/privacy" style="color:${p.accent};text-decoration:none">Privacy</a> ·
      <a href="${SITE_URL}/dashboard/notifications" style="color:${p.accent};text-decoration:none">Email preferences</a>
    </p>
    <p style="font-size:10px;color:${p.muted};margin:14px 0 0;font-family:${BODY_FONT}">
      © ${new Date().getFullYear()} NAFT — Not A Fugazi Trader · Independent broker reviews · You are receiving this because you have a NAFT account.
    </p>
  </div>`;
}

function shell(theme: Theme, inner: string, preheader = '') {
  const p = PALETTES[theme];
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:${p.bg};font-family:${BODY_FONT};color:${p.text}">
${preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0">${preheader}</div>` : ''}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${p.bg};padding:24px 12px">
  <tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:${p.card};border:1px solid ${p.border};border-radius:12px;overflow:hidden">
      <tr><td style="padding:28px 32px 8px">
        <div style="font-family:${HEADING_FONT};font-weight:800;font-size:22px;letter-spacing:1px;text-transform:uppercase;color:${p.text}">
          NOT A FUGAZI <span style="color:${p.accent}">TRADER</span>
        </div>
      </td></tr>
      <tr><td style="padding:8px 32px 28px">
        ${inner}
        ${disclaimerFooter(p)}
      </td></tr>
    </table>
  </td></tr>
</table></body></html>`;
}

function btn(theme: Theme, label: string, href: string) {
  const p = PALETTES[theme];
  return `<a href="${href}" style="display:inline-block;background:${p.accent};color:${p.accentText};padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;letter-spacing:0.3px;font-family:${BODY_FONT}">${label}</a>`;
}

function block(theme: Theme, opts: {
  eyebrow?: string; eyebrowColor?: string;
  heading: string; body: string;
  ctaLabel?: string; ctaUrl?: string;
  extra?: string;
}) {
  const p = PALETTES[theme];
  return `
  ${opts.eyebrow ? `<p style="font-family:'Space Mono',monospace;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:${opts.eyebrowColor || p.eyebrow};margin:20px 0 8px">${opts.eyebrow}</p>` : ''}
  <h1 style="font-family:${HEADING_FONT};font-size:30px;font-weight:800;line-height:1.15;margin:8px 0 14px;color:${p.text}">${opts.heading}</h1>
  <div style="font-size:15px;line-height:1.65;color:${p.muted};margin:0 0 22px">${opts.body}</div>
  ${opts.extra || ''}
  ${opts.ctaLabel && opts.ctaUrl ? `<div style="margin:8px 0 4px">${btn(theme, opts.ctaLabel, opts.ctaUrl)}</div>` : ''}
  `;
}

// ----- Templates -----
type T = (theme: Theme, d: Record<string, any>) => { subject: string; html: string };

const templates: Record<string, T> = {
  welcome: (theme, d) => {
    const name = d.name || 'Trader';
    return {
      subject: `Welcome to NAFT, ${name}`,
      html: shell(theme, block(theme, {
        eyebrow: 'Welcome aboard',
        heading: `You're in, ${name}.`,
        body: `You've joined the community that fights back against fugazi brokers. Real reviews, real scam alerts, real signals — no shilling.<br/><br/>Get started by exploring brokers, checking scam alerts, or filing your first review.`,
        ctaLabel: 'Open your dashboard',
        ctaUrl: `${SITE_URL}/dashboard`,
      }), `Welcome to NAFT, ${name}`),
    };
  },
  verify: (theme, d) => ({
    subject: 'Verify your NAFT email address',
    html: shell(theme, block(theme, {
      eyebrow: 'Verify email',
      heading: 'Confirm your email',
      body: `Tap the button below to verify your email address and unlock your NAFT account.`,
      ctaLabel: 'Verify email',
      ctaUrl: d.url || `${SITE_URL}/auth/callback`,
    }), 'Confirm your NAFT email'),
  }),
  reset: (theme, d) => ({
    subject: 'Reset your NAFT password',
    html: shell(theme, block(theme, {
      eyebrow: 'Password reset',
      heading: 'Reset your password',
      body: `We received a request to reset your password. If this wasn't you, you can ignore this email.`,
      ctaLabel: 'Reset password',
      ctaUrl: d.url || `${SITE_URL}/reset-password`,
    }), 'Reset your NAFT password'),
  }),
  scam_alert: (theme, d) => {
    const p = PALETTES[theme];
    const broker = d.broker || 'A broker on your watchlist';
    return {
      subject: `🚨 Scam Alert: ${broker}`,
      html: shell(theme, block(theme, {
        eyebrow: '⚠ High Severity Alert',
        eyebrowColor: p.danger,
        heading: `Scam alert: ${broker}`,
        body: d.reason || 'Our community has flagged this broker for suspicious activity. Check the full report before depositing or withdrawing.',
        extra: `<div style="background:${p.danger}1a;border-left:4px solid ${p.danger};padding:14px 16px;border-radius:6px;margin:0 0 22px;font-size:13px;color:${p.text}">
          <strong>Severity:</strong> High &nbsp;·&nbsp; <strong>Status:</strong> Under investigation
        </div>`,
        ctaLabel: 'View full alert',
        ctaUrl: `${SITE_URL}/scam-alerts`,
      }), `Scam alert for ${broker}`),
    };
  },
  review_approved: (theme, d) => ({
    subject: 'Your broker review is now live ✅',
    html: shell(theme, block(theme, {
      eyebrow: 'Review approved',
      heading: 'Your review is live.',
      body: `Your review of <strong>${d.broker || 'the broker'}</strong> has been verified and published. Thanks for keeping the community honest.`,
      ctaLabel: 'View your review',
      ctaUrl: d.url || `${SITE_URL}/dashboard/reviews`,
    }), 'Your review was approved'),
  }),
  premium_signal: (theme, d) => {
    const p = PALETTES[theme];
    return {
      subject: `📈 New Premium Signal: ${d.pair || 'XAUUSD'} ${d.direction || 'BUY'}`,
      html: shell(theme, block(theme, {
        eyebrow: 'Premium · ' + (d.direction || 'BUY'),
        heading: `${d.pair || 'XAUUSD'} ${d.direction || 'BUY'} signal`,
        body: d.note || 'A new premium signal is live in your dashboard with entry, SL and TP levels.',
        extra: `<table role="presentation" width="100%" style="margin:0 0 22px;border:1px solid ${p.border};border-radius:8px;border-collapse:separate;border-spacing:0;font-size:13px">
          <tr><td style="padding:10px 14px;color:${p.muted};border-bottom:1px solid ${p.border}">Entry</td><td style="padding:10px 14px;text-align:right;color:${p.text};font-weight:700;border-bottom:1px solid ${p.border}">${d.entry || '2,043.20'}</td></tr>
          <tr><td style="padding:10px 14px;color:${p.muted};border-bottom:1px solid ${p.border}">Stop Loss</td><td style="padding:10px 14px;text-align:right;color:${p.danger};font-weight:700;border-bottom:1px solid ${p.border}">${d.sl || '2,038.00'}</td></tr>
          <tr><td style="padding:10px 14px;color:${p.muted}">Take Profit</td><td style="padding:10px 14px;text-align:right;color:${p.success};font-weight:700">${d.tp || '2,055.00'}</td></tr>
        </table>`,
        ctaLabel: 'View signal',
        ctaUrl: `${SITE_URL}/signals`,
      }), 'New premium signal'),
    };
  },
  complaint_update: (theme, d) => {
    const p = PALETTES[theme];
    return {
      subject: `Update on your complaint #${d.id || 'CMP-2041'}`,
      html: shell(theme, block(theme, {
        eyebrow: `Complaint #${d.id || 'CMP-2041'}`,
        heading: 'Broker has responded',
        body: d.message || 'The broker has posted a response to your complaint. Review it and decide whether to accept the resolution or escalate.',
        extra: `<div style="background:${p.success}1a;border-left:4px solid ${p.success};padding:12px 14px;border-radius:6px;margin:0 0 22px;font-size:13px;color:${p.text}">
          <strong>Status:</strong> Broker Responded
        </div>`,
        ctaLabel: 'Open complaint',
        ctaUrl: `${SITE_URL}/dashboard/complaints`,
      }), 'Update on your complaint'),
    };
  },
  referral: (theme, d) => ({
    subject: '🎉 Someone joined NAFT with your referral',
    html: shell(theme, block(theme, {
      eyebrow: 'Referral bonus',
      heading: 'A new trader joined with your code.',
      body: `Your referral code <strong>${d.code || 'NAFT-A1B2C3'}</strong> just brought a new member to NAFT. Keep sharing — every signup builds the community.`,
      ctaLabel: 'View referral analytics',
      ctaUrl: `${SITE_URL}/dashboard/referrals`,
    }), 'New referral signup'),
  }),
  generic: (theme, d) => ({
    subject: d.subject || 'NAFT Notify',
    html: shell(theme, block(theme, {
      eyebrow: d.eyebrow,
      heading: d.heading || 'Update from NAFT',
      body: d.body || '',
      ctaLabel: d.ctaLabel,
      ctaUrl: d.ctaUrl,
    }), d.preheader || ''),
  }),
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
    const recipients = Array.isArray(body.to) ? body.to : [body.to];
    const theme = await resolveTheme(recipients[0], body.theme);

    const tpl = templates[body.template](theme, body.data || {});
    const subject = body.subject || tpl.subject;
    const html = tpl.html;

    const payload = {
      from: body.from || DEFAULT_FROM,
      to: recipients,
      subject,
      html,
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
    return new Response(JSON.stringify({ success: true, id: data.id, theme }), {
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
