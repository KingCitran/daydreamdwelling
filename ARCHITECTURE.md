# DaydreamDwelling — Monorepo Architecture

## Apps
- `apps/customer/` — Room builder + shop (React 19 + Vite + React Three Fiber)
- `apps/seller/` — Seller dashboard (Phase 3)
- `apps/outdoor/` — Outdoor marketplace (Phase 4)

## Packages
- `packages/shared/supabase.js` — Single Supabase client used by all apps
- `packages/shared/auth/` — AuthContext + useAuth hook

## Supabase
- `supabase/migrations/` — SQL schema files run in order
- `supabase/functions/create-checkout/` — Stripe PaymentIntent Edge Function
- `supabase/functions/stripe-webhook/` — Order status update on payment

## Key files in apps/customer/src/
- `App.jsx` — Root component (wiring + JSX only, no logic)
- `utils/roomGeometry.js` — Pure grid/geometry utilities
- `utils/styles/appStyles.js` — Inline style constants
- `hooks/` — Custom hooks (persistence, undo, cart, room state, item actions)
- `ui/` — All React UI components
- `scene/` — React Three Fiber 3D scene components
- `data/items.js` — Static product catalog (seed data, ~2089 lines — keep as-is)
- `overview/` — House overview / multi-room layout

## Refactor sessions (Phase 1)
- Session 1: Extract pure utilities → utils/roomGeometry.js ✓
- Session 2: Extract inline UI components from App.jsx
- Session 3: Extract custom hooks from App.jsx
- Session 4: Split ShopDrawer.jsx into ui/shop/

## File size rule
No file over 400 lines. Check before adding features.
