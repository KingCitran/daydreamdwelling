// Item interaction rules — defines how items relate to each other and to rooms.
// Eventually this should live in Supabase so new items get rules without a deploy.
//
// Rule types:
// - snapTo: this item aligns to edges of target items
// - goesOn: this item can be placed on the surface of target items
// - roomAffinity: this item shows first when shopping in this room type
// - requiresWall: this item must be placed against a wall
// - maxPerRoom: limit how many of this item per zone
// - pairsWith: suggest placing this item near the target

export const ITEM_RULES = {
  // Seating
  chair:        { snapTo: ['diningTable', 'desk', 'barTable'], roomAffinity: ['Dining Room', 'Office', 'Kitchen'] },
  diningChair:  { snapTo: ['diningTable'], roomAffinity: ['Dining Room'] },
  officeChair:  { snapTo: ['desk', 'gamingDesk'], roomAffinity: ['Office'] },
  barstool:     { snapTo: ['kitchenIsland', 'barTable'], roomAffinity: ['Kitchen'] },

  // Tables
  nightstand:   { snapTo: ['bed', 'bunkBed', 'daybed'], roomAffinity: ['Bedroom', 'Guest Room'] },
  coffeeTable:  { pairsWith: ['sofa', 'loveseat'], roomAffinity: ['Living Room'] },
  deskLamp:     { goesOn: ['desk', 'gamingDesk', 'nightstand'], roomAffinity: ['Office', 'Bedroom'] },
  tableLamp:    { goesOn: ['nightstand', 'sideTable', 'consoleTable'], roomAffinity: ['Bedroom', 'Living Room'] },

  // Bedroom
  bed:          { requiresWall: true, roomAffinity: ['Bedroom', 'Guest Room', 'Nursery'] },
  crib:         { roomAffinity: ['Nursery'] },
  dresser:      { requiresWall: true, roomAffinity: ['Bedroom', 'Closet'] },
  wardrobe:     { requiresWall: true, roomAffinity: ['Bedroom', 'Closet'] },
  vanityTable:  { requiresWall: true, roomAffinity: ['Bedroom', 'Bathroom'] },

  // Living
  sofa:         { requiresWall: true, pairsWith: ['coffeeTable', 'floorLamp'], roomAffinity: ['Living Room'] },
  tvStand:      { requiresWall: true, roomAffinity: ['Living Room', 'Bedroom'] },
  bookshelf:    { requiresWall: true, roomAffinity: ['Office', 'Living Room'] },
  fireplace:    { requiresWall: true, roomAffinity: ['Living Room'] },

  // Kitchen
  kitchenIsland: { roomAffinity: ['Kitchen'] },

  // Lighting
  chandelier:   { maxPerRoom: 1, roomAffinity: ['Dining Room', 'Entryway'] },
  ceilingFan:   { maxPerRoom: 1, roomAffinity: ['Bedroom', 'Living Room'] },
  floorLamp:    { roomAffinity: ['Living Room', 'Bedroom', 'Office'] },

  // Wall items
  mirror:       { requiresWall: true, roomAffinity: ['Bathroom', 'Bedroom', 'Entryway'] },
  wallArt:      { requiresWall: true },
  wallClock:    { requiresWall: true, maxPerRoom: 1 },
  wallShelf:    { requiresWall: true },

  // Structure
  grabBar:      { requiresWall: true, roomAffinity: ['Bathroom'] },
  closetRod:    { roomAffinity: ['Closet'] },
  closetShelf:  { roomAffinity: ['Closet'] },
}

// Room types and their default shop categories (shown first when working in this room)
export const ROOM_SHOP_DEFAULTS = {
  'Kitchen':     ['Tables', 'Seating', 'Lighting'],
  'Living Room': ['Seating', 'Tables', 'Lighting', 'Textiles', 'Decor'],
  'Bedroom':     ['Bedroom', 'Lighting', 'Textiles', 'Storage'],
  'Bathroom':    ['Decor', 'Lighting', 'Structure'],
  'Dining Room': ['Tables', 'Seating', 'Lighting', 'Wall Decor'],
  'Office':      ['Tables', 'Seating', 'Lighting', 'Storage'],
  'Entryway':    ['Storage', 'Lighting', 'Wall Decor', 'Textiles'],
  'Hallway':     ['Lighting', 'Wall Decor', 'Textiles'],
  'Nursery':     ['Bedroom', 'Lighting', 'Decor', 'Storage'],
  'Guest Room':  ['Bedroom', 'Lighting', 'Tables'],
  'Closet':      ['Storage'],
  'Garage':      ['Storage', 'Lighting'],
  'Laundry':     ['Storage'],
  'Patio':       ['Seating', 'Tables', 'Decor', 'Lighting'],
  'Storage':     ['Storage'],
}
