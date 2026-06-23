// ═══════════════════════════════════════════════════════════════
//  Minecraft Storage Tracker — Cloudflare Worker Proxy
//  Keeps your Anthropic API key hidden from the HTML file.
// ═══════════════════════════════════════════════════════════════
//
//  SETUP (one time, takes ~5 minutes):
//
//  1. Go to https://workers.cloudflare.com and sign up free
//
//  2. Click "Create Worker", paste ALL of this code, click Deploy
//
//  3. Add your API key as a secret:
//     - In the Worker dashboard → Settings → Variables
//     - Under "Secret variables" click Add
//     - Name:  ANTHROPIC_KEY
//     - Value: your key from console.anthropic.com
//     - Click Save
//
//  4. Copy your Worker URL — looks like:
//     https://my-worker-name.your-name.workers.dev
//
//  5. Open the Storage Tracker app → tap Scan Screenshot
//     → paste your Worker URL → tap Save & Continue
//     (you only do this once — it's saved on your device)
//
//  That's it. The app never sees your API key.
// ═══════════════════════════════════════════════════════════════

export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    // Parse request body
    let body;
    try { body = await request.json(); }
    catch {
      return new Response(JSON.stringify({ error: { message: 'Invalid JSON body' } }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Forward to Anthropic with the secret key
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    const data = await resp.text();
    return new Response(data, {
      status: resp.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};
