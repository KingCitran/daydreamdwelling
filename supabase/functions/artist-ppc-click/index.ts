// Supabase Edge Function — handles a PPC click on an artist's external link.
// Validates artist has balance, decrements, logs the click, returns redirect URL.
// Server-side to prevent client tampering with click counts / balance.
// Deploy: supabase functions deploy artist-ppc-click
// Env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
)

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { trackId, destinationKey, userId } = await req.json()
    // destinationKey: 'spotify' | 'apple_music' | 'bandcamp' | 'website' | etc.

    if (!trackId || !destinationKey) {
      return new Response(JSON.stringify({ error: 'Missing trackId or destinationKey' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Fetch the track + artist profile in one query
    const { data: track, error: trackErr } = await supabase
      .from('artist_tracks')
      .select('id, artist_id, approval_status')
      .eq('id', trackId)
      .single()

    if (trackErr || !track) {
      return new Response(JSON.stringify({ error: 'Track not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (track.approval_status !== 'approved') {
      return new Response(JSON.stringify({ error: 'Track not approved' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: artist, error: artistErr } = await supabase
      .from('artist_profiles')
      .select('user_id, external_links, ppc_balance_cents, ppc_rate_cents')
      .eq('user_id', track.artist_id)
      .single()

    if (artistErr || !artist) {
      return new Response(JSON.stringify({ error: 'Artist profile not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const links = (artist.external_links ?? {}) as Record<string, string>
    const destinationUrl = links[destinationKey]
    if (!destinationUrl) {
      return new Response(JSON.stringify({ error: 'Destination not configured for this artist' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const cost = artist.ppc_rate_cents ?? 15
    const hasBalance = (artist.ppc_balance_cents ?? 0) >= cost

    // If no balance, still redirect — but don't charge or log as billed.
    // Free passthrough so listeners always reach the artist; only paid clicks fund the artist.
    if (hasBalance) {
      // Decrement balance + log billed click
      await supabase
        .from('artist_profiles')
        .update({ ppc_balance_cents: artist.ppc_balance_cents - cost })
        .eq('user_id', artist.user_id)

      await supabase.from('artist_ppc_clicks').insert({
        track_id:          track.id,
        user_id:           userId ?? null,
        destination_url:   destinationUrl,
        destination_label: destinationKey,
        click_cost_cents:  cost,
        charged:           true,
      })
    } else {
      // Log a free passthrough so the artist still gets analytics
      await supabase.from('artist_ppc_clicks').insert({
        track_id:          track.id,
        user_id:           userId ?? null,
        destination_url:   destinationUrl,
        destination_label: destinationKey,
        click_cost_cents:  0,
        charged:           false,
      })
    }

    return new Response(JSON.stringify({ url: destinationUrl, charged: hasBalance }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('[artist-ppc-click]', err)
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
