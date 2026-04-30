-- Seed artist data for kingcitran@gmail.com so the Artist Dashboard renders
-- with realistic content after DEMO_MODE was flipped to false.
--
-- Safe to re-run: deletes existing seed tracks first, then re-inserts them.
-- Profile is upserted (won't duplicate). PPC clicks are also wiped per-track
-- via cascade when tracks delete, and re-seeded fresh.
--
-- Run in Supabase Dashboard → SQL Editor. Service role bypasses RLS.

do $$
declare
  v_user_id uuid;
  v_t1 uuid := gen_random_uuid();
  v_t2 uuid := gen_random_uuid();
  v_t3 uuid := gen_random_uuid();
  v_t4 uuid := gen_random_uuid();
  v_t5 uuid := gen_random_uuid();
  v_t6 uuid := gen_random_uuid();
begin
  select id into v_user_id from auth.users where email = 'kingcitran@gmail.com';
  if v_user_id is null then
    raise exception 'User kingcitran@gmail.com not found in auth.users — sign in to the app at least once first.';
  end if;

  -- 1. Artist profile (upsert)
  insert into public.artist_profiles (
    user_id, artist_name, bio, external_links, preferred_destination,
    ppc_balance_cents, ppc_rate_cents, is_verified
  ) values (
    v_user_id,
    'Hollow Branches',
    'Ambient and lo-fi for late-night rooms.',
    jsonb_build_object(
      'spotify',  'https://open.spotify.com/',
      'bandcamp', 'https://bandcamp.com/'
    ),
    'spotify',
    450, 15, true
  )
  on conflict (user_id) do update set
    artist_name           = excluded.artist_name,
    bio                   = excluded.bio,
    external_links        = excluded.external_links,
    preferred_destination = excluded.preferred_destination,
    ppc_balance_cents     = excluded.ppc_balance_cents,
    ppc_rate_cents        = excluded.ppc_rate_cents,
    is_verified           = excluded.is_verified;

  -- 2. Wipe existing tracks (cascade clears plays + clicks too)
  delete from public.artist_tracks where artist_id = v_user_id;

  -- 3. Tracks — mirrors the demo data: 4 approved + 1 pending + 1 removed
  insert into public.artist_tracks (
    id, artist_id, title, audio_url, duration_seconds, genre,
    station_tags, mood_tags, approval_status, rotation_status,
    play_count, skip_count, skip_rate, submitted_at, approved_at, rejection_reason
  ) values
    (v_t1, v_user_id, 'Sunrise Hymn',     '/audio/gentle-rain.mp3',    184, 'ambient',
     array['Cozy','Focus'], array['Ember''s Sunrise','Cottagecore Dawn'],
     'approved', 'active',  2890, 394, 0.1200, now() - interval '60 days', now() - interval '58 days', null),
    (v_t2, v_user_id, 'Late Night Drive', '/audio/thunder-rumble.mp3', 213, 'lo-fi',
     array['Evening'], array['Moonlight','Candlelit Cozy Evening'],
     'approved', 'active',  1247, 273, 0.1800, now() - interval '40 days', now() - interval '38 days', null),
    (v_t3, v_user_id, 'Empty Pages',      '/audio/crack-1.mp3',        156, 'ambient',
     array['Cozy'], array['Cottagecore Dawn'],
     'approved', 'active',  423,  190, 0.3100, now() - interval '20 days', now() - interval '19 days', null),
    (v_t4, v_user_id, 'Static Halo',      '/audio/crack-2.mp3',        178, 'electronic',
     array['Bright'], array['Dream State'],
     'approved', 'limited', 102,  90,  0.4700, now() - interval '12 days', now() - interval '11 days', null),
    (v_t5, v_user_id, 'Quietly Drowning', '/audio/crack-3.mp3',        142, 'ambient',
     array['Silence'], array['Moonlight'],
     'pending',  'active',  0,    0,   0,      now() - interval '6 hours', null, null),
    (v_t6, v_user_id, 'Ghost Frequency',  '/audio/crack-4.mp3',        98,  'experimental',
     array['Focus'], array['Dark Academia'],
     'approved', 'removed', 12,   42,  0.7800, now() - interval '90 days', now() - interval '88 days',
     'High skip rate — removed from rotation');

  -- 4. Recent plays (6 rows for the "Recent plays" table).
  -- The bump_track_play_counts trigger will add ~6 to play_count/skip_count
  -- on the affected tracks — visually negligible against the seeded totals.
  insert into public.artist_track_plays (track_id, station, room_mood, completed, duration_played_seconds, played_at) values
    (v_t1, 'Cozy',    'Ember''s Sunrise',           true,  184, now() - interval '15 minutes'),
    (v_t2, 'Evening', 'Moonlight',                  true,  213, now() - interval '42 minutes'),
    (v_t3, 'Cozy',    'Cottagecore Dawn',           false, 18,  now() - interval '1 hour'),
    (v_t1, 'Focus',   'Dark Academia',              true,  184, now() - interval '2 hours'),
    (v_t2, 'Evening', 'Candlelit Cozy Evening',     true,  213, now() - interval '3 hours'),
    (v_t4, 'Cozy',    'Dream State',                false, 22,  now() - interval '5 hours');

  -- 5. PPC clicks — 247 rows so the click-through stat shows "247".
  -- Distributed across approved tracks proportional to plays, spread over the
  -- last 30 days. RLS allows because the SQL editor runs as service role.
  insert into public.artist_ppc_clicks (track_id, destination_url, destination_label, click_cost_cents, clicked_at, charged)
  select
    case
      when n <= 130 then v_t1
      when n <= 200 then v_t2
      when n <= 230 then v_t3
      else               v_t4
    end,
    'https://open.spotify.com/',
    'Spotify',
    15,
    now() - (random() * interval '30 days'),
    true
  from generate_series(1, 247) as gs(n);

  raise notice 'Seeded artist dashboard for user_id %', v_user_id;
end $$;
