---
name: Wallpaper and flooring categories
description: Future item categories — wallpaper applies to wall surfaces, flooring applies material/texture to floor cells
type: project
---

User wants wallpaper and flooring as item categories alongside furniture.

**Wallpaper:** Applied to a wall surface segment. Replaces wall color/material. Interaction: click a visible wall to select it, then choose a wallpaper from the picker.

**Flooring:** Applied to floor cells. Replaces the floor tile color/texture. Could be per-cell or fill the entire room.

**Why:** These are sellable products in the marketplace — sellers list flooring materials and wall treatments the same way they list furniture.

**How to apply:** When building these categories, they need a different interaction model than furniture (no footprint, no dragging — just click-to-apply). The ITEM_CATALOGUE structure supports a `category` field already. Add entries with `category: 'Wallpaper'` and `category: 'Flooring'` and handle them as surface-apply rather than place-and-drag.
