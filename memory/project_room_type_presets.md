---
name: Room type presets
description: Future feature — selecting a room type (bedroom, living room, etc.) should populate different size presets in the Panel
type: project
---

User wants room-type-aware presets in the future. Choosing "bedroom" vs "living room" vs "home office" would show different recommended sizes in the quick-size panel.

**Why:** Different room categories have different standard footprints. Speeds up the design flow for customers.

**How to apply:** When building the room-type selector (a future stage), wire it so PRESETS in Panel.jsx are derived from the selected room type rather than a static array.
