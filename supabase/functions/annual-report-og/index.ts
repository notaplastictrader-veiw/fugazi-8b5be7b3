import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const url = new URL(req.url)
  const year = url.searchParams.get('year') || String(new Date().getFullYear())
  const users = url.searchParams.get('users') || '12,400'
  const reviews = url.searchParams.get('reviews') || '3,820'
  const alerts = url.searchParams.get('alerts') || '47'
  const winRate = url.searchParams.get('win_rate') || '78'

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0a0a0a"/>
      <stop offset="1" stop-color="#1a1a1a"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <g font-family="Arial, sans-serif" fill="#ffffff">
    <text x="60" y="100" font-size="22" letter-spacing="6" fill="#a3e635">NAFT · ANNUAL REPORT</text>
    <text x="60" y="220" font-size="120" font-weight="900">State of Brokers</text>
    <text x="60" y="320" font-size="120" font-weight="900" fill="#a3e635">${year}</text>
    <g font-size="28" fill="#cccccc">
      <text x="60" y="440">${users} new traders</text>
      <text x="60" y="490">${reviews} verified reviews · ${alerts} scam alerts</text>
      <text x="60" y="540">Signal win rate: ${winRate}%</text>
    </g>
    <text x="60" y="600" font-size="20" letter-spacing="4" fill="#888888">notafugazitrader.com</text>
  </g>
</svg>`

  return new Response(svg, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600',
    },
  })
})
