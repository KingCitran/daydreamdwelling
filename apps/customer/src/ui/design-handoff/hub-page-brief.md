# Hub Page — Claude Design Brief

## What this page is

The **central dashboard** of DaydreamDwelling. Opens when any user clicks the DaydreamDwelling logo from anywhere in the app (builder, community, about, profile). It's the "home base" — empowering, aesthetic, dreamy. Not a settings page. Not an admin panel. A beautiful command center that makes the user feel like they're at the heart of something alive.

**URL:** `/?hub=1`
**Current implementation:** `apps/customer/src/pages/HubPage.jsx`

## Design direction

- **Background:** The current mood's sky gradient (CSS only — no canvas, no WebGL, no clouds). Lightweight.
- **All content on solid opaque cards** using the mood's `panelBg` / `panelText` / `panelBorder` tokens. This ensures readability on any mood, light or dark.
- **Fonts:** Outfit (UI), EB Garamond (serif headings). Same as the rest of the app.
- **Wispy mascot** appears in the hero greeting and closing. Use the existing `WispyArt` component (`slot="happy"` for hero, `slot="resting"` for closing).
- **Mood-adaptive:** Every card, text, accent color comes from the active theme tokens. No hardcoded colors.
- **Aesthetic reference:** Think clean dashboard meets dreamy editorial. NOT corporate SaaS. NOT a settings page. More like a beautiful magazine table of contents that happens to have live data.

## Greeting

"Welcome home, [display_name]." — pulled from `profile.display_name` or `user.email` prefix. If signed out, just "Welcome home."

## Available stats (pick what feels right — don't use all of them)

### Platform health
| Stat | Source | Notes |
|---|---|---|
| Waitlist count | `waitlist` table | How many people signed up before launch |
| Registered users | `profiles` table | Total accounts |
| New signups (30d) | `profiles.created_at` | Growth signal |

### Rooms & Design
| Stat | Source | Notes |
|---|---|---|
| Rooms designed | `saved_rooms` count | Cloud-saved rooms |
| Shared designs | `community_posts` count | Public room shares |
| Contest entries | `contest_entries` count | Creative engagement |
| Wishlist items saved | `wishlist_items` count | Desire signal |

### Commerce
| Stat | Source | Notes |
|---|---|---|
| Products listed | `products` where `active=true` | Catalogue size |
| Active sellers | `profiles` where `stripe_account_id` not null | Verified sellers |
| Total orders | `orders` count | Commerce volume |
| Revenue (all-time) | `sum(orders.total_cents)` | Platform GMV |
| Avg order value | `avg(orders.total_cents)` | Basket health |

### Music & Artists
| Stat | Source | Notes |
|---|---|---|
| Approved tracks | `artist_tracks` where approved | Music library size |
| Track plays (all-time) | `sum(artist_tracks.play_count)` | Listening engagement |
| Raindrops given | `artist_track_raindrops` count | Listener appreciation |
| Artist profiles | `artist_profiles` count | Creator community |

### Community
| Stat | Source | Notes |
|---|---|---|
| Community hearts | `community_hearts` count | Love signal |
| Messages sent | `messages` count | Connection |
| Feedback submissions | `feedback` count | Voice of the user |

**Hayley's note:** She's not sure she likes the current stats layout (6 cards in a row). The designer should explore different treatments — maybe a single highlight number, a compact row, a sidebar, or stats woven into the section headers. Less might be more.

## Navigation sections

### "Where would you like to go?" — 6 destination cards
| Destination | Emoji | Description | Link |
|---|---|---|---|
| Room Builder | 🏠 | Design your space in 3D with real furniture | `/` |
| Marketplace | 🛍️ | Browse and buy from independent sellers | `/?shop=1` |
| Community | 🎨 | Share rooms, enter contests, discover designs | `/community` |
| Music | 🎵 | Listen to curated stations while you design | `/community/music` |
| About | ☁ | The story behind DaydreamDwelling | `/?about=1` |
| Blossoms | 🌿 | Outdoor & garden shop (external) | `https://daydreamblossoms.com` |

### "For creators" — 2 CTA cards
| Card | Emoji | Description | CTA | Link |
|---|---|---|---|---|
| Sell on Daydream | 🏪 | List your handmade furniture and decor | Seller Dashboard → | `https://daydreamsellers.com` |
| Submit Music | 🎶 | Share tracks, get plays, earn from clicks | Artist Portal → | `/community/artists` |

### "Fresh on the shelf" — horizontal scroll of recent products
- 6 most recent active products with thumbnail + label
- Product images from `product_images` storage bucket

### Landing page link
- Accessible via the hub. Currently at `/?landing=1`.
- Should feel like a subtle "see our public homepage" link, not a primary action.

## Layout constraints

- **Max width:** 960px centered
- **Mobile responsive:** Cards stack to single column. Stats maybe 2-col or horizontal scroll.
- **Performance:** No 3D, no cloud conveyor, no heavy assets. CSS gradients + Supabase queries only. Must load fast on mobile.
- **Header:** Sticky, opaque card bar with logo + "← Builder" button
- **Footer:** Same solid card bar with nav links + copyright

## Theme token reference

The page uses these from `useTheme()`:

```
t.panelBg        — card background (mood-tinted, opaque)
t.panelText      — primary text on cards
t.panelTextSoft  — secondary/muted text on cards
t.panelBorder    — card border
t.panelSurface   — slightly lighter card surface (for nested elements)
t.accent         — mood accent color (buttons, highlights)
t.accentText     — text color on accent backgrounds
t.bg             — page background (but we use sky gradient instead)
```

## Files to reference

- Current implementation: `apps/customer/src/pages/HubPage.jsx`
- Theme tokens: `packages/shared/themes.js`
- Sky gradients: `apps/customer/src/scene/SkyBackdrop.jsx` (the SKY object)
- Wispy mascot: `packages/shared/wispy/art.jsx` — `<WispyArt slot="happy" mood={mood} width={90} />`
- Logo: `packages/shared/Logo.jsx`
- Builder top bar: `apps/customer/src/ui/MobileChrome.jsx` (BuilderTopBar)

## What the designer should deliver

1. A single-page layout prototype (HTML/CSS or React) showing the hub at desktop + mobile widths
2. Stat treatment options — at least 2-3 different approaches to presenting the numbers
3. Card style that feels dreamy but grounded — not clinical, not messy
4. How the page transitions feel (hover states, card lifts, etc.)
5. Consideration for what the page looks like with 0 stats (new user, no data yet)
