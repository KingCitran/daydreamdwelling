// Building Templates — complete floor plans with rooms, walls, doors, and furniture.
// Each building defines cells, internalWalls, doorOpenings, items, and zone labels.
// Multi-floor buildings define an array of floors.

// Helper: generate a filled rectangle of cells
function rect(x, y, w, d) {
  const cells = []
  for (let c = x; c < x + w; c++)
    for (let r = y; r < y + d; r++)
      cells.push(`${c},${r}`)
  return cells
}

// Helper: generate internal walls along a line
function wallLine(x, y, dir, length) {
  const walls = []
  for (let i = 0; i < length; i++) {
    const c = dir === 'E' || dir === 'W' ? x : x + i
    const r = dir === 'N' || dir === 'S' ? y : y + i
    walls.push(`${c},${r}:${dir}`)
  }
  return walls
}

export const BUILDING_TEMPLATES = [
  // ── 1. Suburban House (2-story) ────────────────────────────────────
  {
    id: 'house',
    name: 'Suburban Home',
    icon: '🏠',
    desc: '3BR/2BA two-story house with kitchen, living, dining',
    floors: [
      {
        level: 0,
        label: 'Ground Floor',
        gridW: 32, gridD: 26,
        cells: [
          ...rect(1, 1, 30, 24),
        ],
        internalWalls: [
          // Entry wall (separates foyer from living)
          ...wallLine(7, 1, 'E', 8),
          // Kitchen/living divider (partial wall)
          ...wallLine(16, 1, 'E', 12),
          // Kitchen/dining divider
          ...wallLine(16, 13, 'S', 15),
          // Half bath walls
          ...wallLine(1, 19, 'S', 6),
          ...wallLine(7, 19, 'W', 6),
        ],
        doorOpenings: [
          '7,4:E',    // Foyer → Living
          '16,6:E',   // Living → Kitchen
          '24,13:S',  // Kitchen → Dining
          '3,19:S',   // Hallway → Half bath
        ],
        zoneLabels: {
          'zone_1,1': 'Foyer',
          'zone_1,9': 'Living Room',
          'zone_17,1': 'Kitchen',
          'zone_17,14': 'Dining Room',
          'zone_1,20': 'Powder Room',
        },
        items: [
          // Living room
          { typeKey: 'sofa', col: 3, row: 10, rotation: 0 },
          { typeKey: 'coffeeTable', col: 4, row: 8, rotation: 0 },
          { typeKey: 'tvStand', col: 4, row: 2, rotation: 0 },
          { typeKey: 'floorLamp', col: 1, row: 1, rotation: 0 },
          // Kitchen
          { typeKey: 'kitchenIsland', col: 20, row: 5, rotation: 0 },
          // Dining room
          { typeKey: 'diningTable', col: 21, row: 17, rotation: 0 },
          { typeKey: 'chair', col: 20, row: 16, rotation: 0 },
          { typeKey: 'chair', col: 23, row: 16, rotation: 0 },
          { typeKey: 'chair', col: 20, row: 19, rotation: 180 },
          { typeKey: 'chair', col: 23, row: 19, rotation: 180 },
          // Foyer
          { typeKey: 'entryBench', col: 2, row: 3, rotation: 0 },
        ],
      },
      {
        level: 1,
        label: 'Upper Floor',
        gridW: 32, gridD: 26,
        cells: [
          ...rect(1, 1, 30, 24),
        ],
        internalWalls: [
          // Master bedroom wall
          ...wallLine(16, 1, 'E', 12),
          // Master bath wall
          ...wallLine(16, 13, 'S', 8),
          ...wallLine(24, 13, 'W', 12),
          // Bedroom 2 wall
          ...wallLine(1, 13, 'S', 15),
          // Bedroom 3 / hall bath divider
          ...wallLine(8, 13, 'E', 12),
          ...wallLine(8, 19, 'S', 8),
        ],
        doorOpenings: [
          '16,5:E',   // Hall → Master BR
          '20,13:S',  // Master BR → Master Bath
          '5,13:S',   // Hall → Bedroom 2
          '8,16:E',   // Hall → Bedroom 3
          '12,19:S',  // Hall → Bath
        ],
        zoneLabels: {
          'zone_17,1': 'Master Bedroom',
          'zone_17,14': 'Master Bath',
          'zone_1,1': 'Hallway',
          'zone_1,14': 'Bedroom 2',
          'zone_9,14': 'Bedroom 3',
          'zone_9,20': 'Bathroom',
        },
        items: [
          // Master bedroom
          { typeKey: 'bed', col: 21, row: 2, rotation: 0 },
          { typeKey: 'nightstand', col: 19, row: 2, rotation: 0 },
          { typeKey: 'nightstand', col: 26, row: 2, rotation: 0 },
          { typeKey: 'dresser', col: 17, row: 8, rotation: 90 },
          // Bedroom 2
          { typeKey: 'bed', col: 4, row: 15, rotation: 0 },
          { typeKey: 'nightstand', col: 2, row: 15, rotation: 0 },
          { typeKey: 'desk', col: 10, row: 15, rotation: 0 },
          // Bedroom 3
          { typeKey: 'bed', col: 11, row: 15, rotation: 0 },
          { typeKey: 'nightstand', col: 9, row: 15, rotation: 0 },
        ],
      },
    ],
  },

  // ── 2. Boutique Hotel Floor ────────────────────────────────────────
  {
    id: 'hotel',
    name: 'Boutique Hotel',
    icon: '🏨',
    desc: 'Hotel floor with 6 guest rooms, lobby, and corridor',
    floors: [
      {
        level: 0,
        label: 'Ground Floor',
        gridW: 52, gridD: 28,
        cells: [
          // Lobby
          ...rect(1, 10, 10, 8),
          // Corridor
          ...rect(11, 12, 38, 4),
          // Rooms — north side (3 rooms)
          ...rect(11, 1, 12, 11),
          ...rect(23, 1, 12, 11),
          ...rect(35, 1, 14, 11),
          // Rooms — south side (3 rooms)
          ...rect(11, 16, 12, 11),
          ...rect(23, 16, 12, 11),
          ...rect(35, 16, 14, 11),
        ],
        internalWalls: [
          // Lobby → corridor
          ...wallLine(11, 12, 'W', 4),
          // North room dividers
          ...wallLine(23, 1, 'W', 11),
          ...wallLine(35, 1, 'W', 11),
          // North rooms → corridor
          ...wallLine(11, 12, 'N', 12),
          ...wallLine(23, 12, 'N', 12),
          ...wallLine(35, 12, 'N', 14),
          // South room dividers
          ...wallLine(23, 16, 'W', 11),
          ...wallLine(35, 16, 'W', 11),
          // South rooms → corridor
          ...wallLine(11, 15, 'S', 12),
          ...wallLine(23, 15, 'S', 12),
          ...wallLine(35, 15, 'S', 14),
        ],
        doorOpenings: [
          '11,13:W',  // Lobby → Corridor
          // North room doors
          '16,12:N',
          '28,12:N',
          '40,12:N',
          // South room doors
          '16,15:S',
          '28,15:S',
          '40,15:S',
        ],
        zoneLabels: {
          'zone_1,10': 'Lobby',
          'zone_11,1': 'Room 101',
          'zone_23,1': 'Room 102',
          'zone_35,1': 'Room 103',
          'zone_11,16': 'Room 104',
          'zone_23,16': 'Room 105',
          'zone_35,16': 'Room 106',
        },
        items: [
          // Lobby
          { typeKey: 'sofa', col: 3, row: 12, rotation: 0 },
          { typeKey: 'coffeeTable', col: 4, row: 11, rotation: 0 },
          // Room 101
          { typeKey: 'bed', col: 14, row: 2, rotation: 0 },
          { typeKey: 'nightstand', col: 12, row: 2, rotation: 0 },
          { typeKey: 'nightstand', col: 18, row: 2, rotation: 0 },
          { typeKey: 'desk', col: 12, row: 7, rotation: 0 },
          // Room 102
          { typeKey: 'bed', col: 26, row: 2, rotation: 0 },
          { typeKey: 'nightstand', col: 24, row: 2, rotation: 0 },
          { typeKey: 'nightstand', col: 30, row: 2, rotation: 0 },
          // Room 103
          { typeKey: 'bed', col: 39, row: 2, rotation: 0 },
          { typeKey: 'nightstand', col: 37, row: 2, rotation: 0 },
          { typeKey: 'nightstand', col: 43, row: 2, rotation: 0 },
          // Room 104-106 (south side, mirrored)
          { typeKey: 'bed', col: 14, row: 18, rotation: 0 },
          { typeKey: 'nightstand', col: 12, row: 18, rotation: 0 },
          { typeKey: 'bed', col: 26, row: 18, rotation: 0 },
          { typeKey: 'nightstand', col: 24, row: 18, rotation: 0 },
          { typeKey: 'bed', col: 39, row: 18, rotation: 0 },
          { typeKey: 'nightstand', col: 37, row: 18, rotation: 0 },
        ],
      },
    ],
  },

  // ── 3. Modern Office ───────────────────────────────────────────────
  {
    id: 'office',
    name: 'Modern Office',
    icon: '🏢',
    desc: 'Open plan with private offices, conference room, break room',
    floors: [
      {
        level: 0,
        label: 'Office Floor',
        gridW: 42, gridD: 32,
        cells: [
          ...rect(1, 1, 40, 30),
        ],
        internalWalls: [
          // Reception wall
          ...wallLine(1, 9, 'S', 12),
          // Private offices (3 along the right wall)
          ...wallLine(31, 1, 'W', 9),
          ...wallLine(31, 10, 'S', 10),
          ...wallLine(31, 10, 'W', 9),
          ...wallLine(31, 19, 'S', 10),
          ...wallLine(31, 19, 'W', 9),
          // Conference room (bottom-left)
          ...wallLine(1, 21, 'S', 14),
          ...wallLine(15, 21, 'W', 10),
          // Break room (bottom-right)
          ...wallLine(24, 21, 'S', 17),
          ...wallLine(24, 21, 'W', 10),
        ],
        doorOpenings: [
          '6,9:S',    // Reception → Open plan
          '31,4:W',   // Open plan → Office 1
          '31,13:W',  // Open plan → Office 2
          '31,23:W',  // Open plan → Office 3
          '8,21:S',   // Open plan → Conference
          '28,21:S',  // Open plan → Break room
        ],
        zoneLabels: {
          'zone_1,1': 'Reception',
          'zone_1,10': 'Open Plan',
          'zone_32,1': 'Office A',
          'zone_32,11': 'Office B',
          'zone_32,20': 'Office C',
          'zone_1,22': 'Conference Room',
          'zone_25,22': 'Break Room',
        },
        items: [
          // Reception
          { typeKey: 'desk', col: 4, row: 3, rotation: 0 },
          { typeKey: 'officeChair', col: 5, row: 5, rotation: 0 },
          { typeKey: 'sofa', col: 1, row: 6, rotation: 0 },
          // Open plan desks
          { typeKey: 'desk', col: 5, row: 12, rotation: 0 },
          { typeKey: 'desk', col: 5, row: 15, rotation: 0 },
          { typeKey: 'desk', col: 12, row: 12, rotation: 0 },
          { typeKey: 'desk', col: 12, row: 15, rotation: 0 },
          { typeKey: 'desk', col: 19, row: 12, rotation: 0 },
          { typeKey: 'desk', col: 19, row: 15, rotation: 0 },
          { typeKey: 'officeChair', col: 6, row: 14, rotation: 0 },
          { typeKey: 'officeChair', col: 6, row: 17, rotation: 0 },
          { typeKey: 'officeChair', col: 13, row: 14, rotation: 0 },
          { typeKey: 'officeChair', col: 13, row: 17, rotation: 0 },
          { typeKey: 'officeChair', col: 20, row: 14, rotation: 0 },
          { typeKey: 'officeChair', col: 20, row: 17, rotation: 0 },
          // Private offices
          { typeKey: 'desk', col: 34, row: 3, rotation: 0 },
          { typeKey: 'officeChair', col: 35, row: 5, rotation: 0 },
          { typeKey: 'bookshelf', col: 38, row: 1, rotation: 0 },
          { typeKey: 'desk', col: 34, row: 12, rotation: 0 },
          { typeKey: 'officeChair', col: 35, row: 14, rotation: 0 },
          { typeKey: 'desk', col: 34, row: 22, rotation: 0 },
          { typeKey: 'officeChair', col: 35, row: 24, rotation: 0 },
          // Conference
          { typeKey: 'diningTable', col: 5, row: 24, rotation: 0 },
          { typeKey: 'chair', col: 4, row: 23, rotation: 0 },
          { typeKey: 'chair', col: 7, row: 23, rotation: 0 },
          { typeKey: 'chair', col: 4, row: 26, rotation: 180 },
          { typeKey: 'chair', col: 7, row: 26, rotation: 180 },
          { typeKey: 'chair', col: 10, row: 23, rotation: 0 },
          { typeKey: 'chair', col: 10, row: 26, rotation: 180 },
          // Break room
          { typeKey: 'diningTable', col: 28, row: 24, rotation: 0 },
          { typeKey: 'chair', col: 27, row: 23, rotation: 0 },
          { typeKey: 'chair', col: 30, row: 23, rotation: 0 },
          { typeKey: 'chair', col: 27, row: 26, rotation: 180 },
          { typeKey: 'chair', col: 30, row: 26, rotation: 180 },
          { typeKey: 'sofa', col: 35, row: 24, rotation: 90 },
        ],
      },
    ],
  },

  // ── 4. Warehouse / Distribution Center ─────────────────────────────
  {
    id: 'warehouse',
    name: 'Warehouse',
    icon: '🏭',
    desc: 'Open warehouse floor with office, break room, loading area',
    floors: [
      {
        level: 0,
        label: 'Main Floor',
        gridW: 52, gridD: 42,
        cells: [
          ...rect(1, 1, 50, 40),
        ],
        internalWalls: [
          // Office block (top-left corner)
          ...wallLine(1, 11, 'S', 14),
          ...wallLine(15, 1, 'W', 10),
          // Break room (next to office)
          ...wallLine(15, 11, 'W', 10),
          ...wallLine(15, 11, 'S', 10),
          ...wallLine(25, 1, 'W', 10),
          // Restrooms (small block near office)
          ...wallLine(1, 16, 'S', 7),
          ...wallLine(8, 11, 'W', 5),
        ],
        doorOpenings: [
          '8,11:S',   // Office → warehouse
          '18,11:S',  // Break room → warehouse
          '4,16:S',   // Restroom → hallway
        ],
        zoneLabels: {
          'zone_1,1': 'Office',
          'zone_16,1': 'Break Room',
          'zone_1,12': 'Restroom',
          'zone_1,17': 'Warehouse Floor',
        },
        items: [
          // Office
          { typeKey: 'desk', col: 3, row: 3, rotation: 0 },
          { typeKey: 'officeChair', col: 4, row: 5, rotation: 0 },
          { typeKey: 'desk', col: 9, row: 3, rotation: 0 },
          { typeKey: 'officeChair', col: 10, row: 5, rotation: 0 },
          { typeKey: 'bookshelf', col: 12, row: 1, rotation: 0 },
          // Break room
          { typeKey: 'diningTable', col: 18, row: 4, rotation: 0 },
          { typeKey: 'chair', col: 17, row: 3, rotation: 0 },
          { typeKey: 'chair', col: 20, row: 3, rotation: 0 },
          { typeKey: 'chair', col: 17, row: 6, rotation: 180 },
          { typeKey: 'chair', col: 20, row: 6, rotation: 180 },
        ],
      },
    ],
  },

  // ── 5. Two-Bedroom Apartment ───────────────────────────────────────
  {
    id: 'apartment',
    name: '2BR Apartment',
    icon: '🏬',
    desc: 'Compact 2-bedroom apartment with kitchen, bath, balcony',
    floors: [
      {
        level: 0,
        label: 'Unit',
        gridW: 28, gridD: 20,
        cells: [
          // Main unit
          ...rect(1, 1, 24, 16),
          // Balcony (2-cell deep porch)
          ...rect(1, 17, 10, 2),
        ],
        internalWalls: [
          // Kitchen wall
          ...wallLine(1, 8, 'S', 9),
          // Bedroom 1 wall
          ...wallLine(14, 1, 'W', 8),
          ...wallLine(14, 8, 'S', 11),
          // Bedroom 2 wall
          ...wallLine(14, 9, 'W', 8),
          // Bathroom walls
          ...wallLine(10, 9, 'S', 4),
          ...wallLine(10, 9, 'W', 8),
          // Entry closet
          ...wallLine(22, 1, 'W', 4),
        ],
        doorOpenings: [
          '5,8:S',    // Kitchen → Living
          '14,4:W',   // Hall → Bedroom 1
          '14,12:W',  // Living → Bedroom 2
          '10,11:S',  // Hall → Bathroom
          '22,3:W',   // Entry → Closet
        ],
        zoneLabels: {
          'zone_1,1': 'Kitchen',
          'zone_1,9': 'Living / Dining',
          'zone_15,1': 'Master Bedroom',
          'zone_15,10': 'Bedroom 2',
          'zone_11,10': 'Bathroom',
          'zone_23,1': 'Closet',
          'zone_1,17': 'Balcony',
        },
        items: [
          // Kitchen
          { typeKey: 'kitchenIsland', col: 3, row: 3, rotation: 0 },
          { typeKey: 'barstool', col: 2, row: 5, rotation: 0 },
          { typeKey: 'barstool', col: 5, row: 5, rotation: 0 },
          // Living
          { typeKey: 'sofa', col: 3, row: 12, rotation: 0 },
          { typeKey: 'coffeeTable', col: 4, row: 10, rotation: 0 },
          { typeKey: 'tvStand', col: 1, row: 9, rotation: 0 },
          { typeKey: 'rug', col: 2, row: 10, rotation: 0 },
          // Master bedroom
          { typeKey: 'bed', col: 18, row: 2, rotation: 0 },
          { typeKey: 'nightstand', col: 16, row: 2, rotation: 0 },
          { typeKey: 'nightstand', col: 22, row: 2, rotation: 0 },
          { typeKey: 'dresser', col: 15, row: 6, rotation: 90 },
          // Bedroom 2
          { typeKey: 'bed', col: 17, row: 11, rotation: 0 },
          { typeKey: 'nightstand', col: 15, row: 11, rotation: 0 },
          { typeKey: 'desk', col: 21, row: 11, rotation: 0 },
          // Balcony
          { typeKey: 'plant', col: 1, row: 17, rotation: 0 },
          { typeKey: 'plant', col: 9, row: 17, rotation: 0 },
        ],
      },
    ],
  },
]
