// Parhelia icon library — 24×24, currentColor stroke 1.9, round caps/joins, duotone fills at .22
// Live paths synced from packages/shared/ui/Icon.jsx + RaindropIcon.jsx; additions marked NEW.
window.PARHELIA_ICONS = {
  // live
  cart:   [{ d: 'M3 4h2l2.5 11h11l2-7H7M9 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM17 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z' }],
  search: [{ d: 'M18 11a7 7 0 1 1-14 0 7 7 0 0 1 14 0zM16 16l5 5' }],
  filter: [{ d: 'M4 6h16M7 12h10M10 18h4' }],
  user:   [{ d: 'M16 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM4 21a8 8 0 0 1 16 0' }],
  heart:  [{ d: 'M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z' }],
  chevronRight: [{ d: 'M9 6l6 6-6 6' }],
  close:  [{ d: 'M6 6l12 12M18 6l-12 12' }],
  menu:   [{ d: 'M4 7h16M4 12h16M4 17h16' }],
  room:   [{ d: 'M4 15.5l8 4.5 8-4.5-8-4.5z', fill: 'currentColor', op: 0.22, stroke: 'none' }, { d: 'M4 15.5l8-4.5 8 4.5-8 4.5zM4 15.5v-7L12 4M20 15.5v-7L12 4M12 4v7' }],
  raindrop: [{ d: 'M12 2C12 2 5 10.5 5 15.5C5 19.36 8.13 22 12 22C15.87 22 19 19.36 19 15.5C19 10.5 12 2 12 2Z', op: 0.6 }, { d: 'M12 10.5l.8 2.7 2.7.8-2.7.8-.8 2.7-.8-2.7-2.7-.8 2.7-.8z', fill: 'currentColor', stroke: 'none', op: 0.7 }],
  // NEW
  heartFilled: [{ d: 'M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z', fill: 'currentColor', op: 0.22 }, { d: 'M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z' }],
  raindropFilled: [{ d: 'M12 2C12 2 5 10.5 5 15.5C5 19.36 8.13 22 12 22C15.87 22 19 19.36 19 15.5C19 10.5 12 2 12 2Z', fill: 'currentColor', stroke: 'none', op: 0.9 }, { d: 'M12 10.5l.8 2.7 2.7.8-2.7.8-.8 2.7-.8-2.7-2.7-.8 2.7-.8z', fill: '#fff', stroke: 'none' }],
  roomWindow: [{ d: 'M4 15.5l8 4.5 8-4.5-8-4.5z', fill: 'currentColor', op: 0.22, stroke: 'none' }, { d: 'M4 15.5l8-4.5 8 4.5-8 4.5zM4 15.5v-7L12 4M20 15.5v-7L12 4M12 4v7' }, { d: 'M6.6 9.6v3.6c1.6-.4 2.6-1.5 2.6-2.7 0-1.1-1-1.4-2.6-.9z' }],
  roomDoor: [{ d: 'M4 15.5l8 4.5 8-4.5-8-4.5z', fill: 'currentColor', op: 0.22, stroke: 'none' }, { d: 'M4 15.5l8-4.5 8 4.5-8 4.5zM4 15.5v-7L12 4M20 15.5v-7L12 4M12 4v7' }, { d: 'M14.2 12.7V7.6a1.9 1.9 0 0 1 3.8 1.9v4.6z', fill: 'currentColor', op: 0.22 }, { d: 'M15.3 10.4v.1' }],
  roomRug: [{ d: 'M4 15.5l8 4.5 8-4.5-8-4.5z', fill: 'currentColor', op: 0.22, stroke: 'none' }, { d: 'M4 15.5l8-4.5 8 4.5-8 4.5zM4 15.5v-7L12 4M20 15.5v-7L12 4M12 4v7' }, { d: 'M9.5 15.3c0-.7 1.1-1.3 2.5-1.3s2.5.6 2.5 1.3-1.1 1.3-2.5 1.3-2.5-.6-2.5-1.3z' }],
  roomPlan: [{ d: 'M5 5h14v14H5z' }, { d: 'M5 12h5M12 5v4M12 19v-3M14.5 12H19' }],
  wispy:  [{ d: 'M7 18h10a4 4 0 0 0 .5-8A5.5 5.5 0 0 0 7 9.5 4.25 4.25 0 0 0 7 18z', fill: 'currentColor', op: 0.22 }, { d: 'M7 18h10a4 4 0 0 0 .5-8A5.5 5.5 0 0 0 7 9.5 4.25 4.25 0 0 0 7 18z' }, { d: 'M10 13.5v.1M14 13.5v.1' }],
  parhelion: [{ d: 'M15.5 11a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0z', fill: 'currentColor', op: 0.22 }, { d: 'M4.5 11a7.5 7.5 0 0 1 15 0' }, { d: 'M4.5 11v.1M19.5 11v.1M12 3v.1' }, { d: 'M3 17h18' }],
  sparkle: [{ d: 'M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z' }, { d: 'M18 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z' }],
};
