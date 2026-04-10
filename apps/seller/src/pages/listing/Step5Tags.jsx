import { useTheme } from '@shared/ThemeProvider'
import { Card, Field } from './Step1Identity'

// Sellable item types — label (category) pairs for the type key picker
// Excludes floors, wall treatments, doors, stairs
const CATALOGUE_OPTIONS = [
  { key: 'sofa',            label: 'Sofa (Seating)'            },
  { key: 'loveseat',        label: 'Loveseat (Seating)'        },
  { key: 'chair',           label: 'Accent Chair (Seating)'    },
  { key: 'boucleChair',     label: 'Bouclé Chair (Seating)'    },
  { key: 'recliner',        label: 'Recliner (Seating)'        },
  { key: 'diningChair',     label: 'Dining Chair (Seating)'    },
  { key: 'bench',           label: 'Bench (Seating)'           },
  { key: 'ottoman',         label: 'Ottoman (Seating)'         },
  { key: 'floorCushion',    label: 'Floor Cushion (Seating)'   },
  { key: 'beanBag',         label: 'Bean Bag (Seating)'        },
  { key: 'barstool',        label: 'Barstool (Seating)'        },
  { key: 'chaiseLounge',    label: 'Chaise Lounge (Seating)'   },
  { key: 'swingChair',      label: 'Swing Chair (Seating)'     },
  { key: 'gamingChair',     label: 'Gaming Chair (Seating)'    },
  { key: 'diningTable',     label: 'Dining Table (Tables)'     },
  { key: 'coffeeTable',     label: 'Coffee Table (Tables)'     },
  { key: 'sideTable',       label: 'Side Table (Tables)'       },
  { key: 'consoleTable',    label: 'Console Table (Tables)'    },
  { key: 'desk',            label: 'Desk (Tables)'             },
  { key: 'barTable',        label: 'Bar Table (Tables)'        },
  { key: 'nestingTables',   label: 'Nesting Tables (Tables)'   },
  { key: 'kitchenIsland',   label: 'Kitchen Island (Tables)'   },
  { key: 'gamingDesk',      label: 'Gaming Desk (Tables)'      },
  { key: 'bookshelf',       label: 'Bookshelf (Storage)'       },
  { key: 'cabinet',         label: 'Cabinet (Storage)'         },
  { key: 'dresser',         label: 'Dresser (Storage)'         },
  { key: 'tvStand',         label: 'TV Stand (Storage)'        },
  { key: 'wardrobe',        label: 'Wardrobe (Storage)'        },
  { key: 'sideboard',       label: 'Sideboard (Storage)'       },
  { key: 'shoeRack',        label: 'Shoe Rack (Storage)'       },
  { key: 'entryBench',      label: 'Entry Bench (Storage)'     },
  { key: 'kidsStorage',     label: 'Kids Storage (Storage)'    },
  { key: 'bed',             label: 'Bed Frame (Bedroom)'       },
  { key: 'nightstand',      label: 'Nightstand (Bedroom)'      },
  { key: 'bunkBed',         label: 'Bunk Bed (Bedroom)'        },
  { key: 'daybed',          label: 'Daybed (Bedroom)'          },
  { key: 'crib',            label: 'Crib (Bedroom)'            },
  { key: 'vanityTable',     label: 'Vanity Table (Bedroom)'    },
  { key: 'mirror',          label: 'Mirror (Wall Decor)'       },
  { key: 'wallArt',         label: 'Wall Art (Wall Decor)'     },
  { key: 'wallShelf',       label: 'Wall Shelf (Wall Decor)'   },
  { key: 'tapestry',        label: 'Tapestry (Wall Decor)'     },
  { key: 'wallClock',       label: 'Wall Clock (Wall Decor)'   },
  { key: 'macrame',         label: 'Macramé (Wall Decor)'      },
  { key: 'floorLamp',       label: 'Floor Lamp (Lighting)'     },
  { key: 'tableLamp',       label: 'Table Lamp (Lighting)'     },
  { key: 'stringLights',    label: 'String Lights (Lighting)'  },
  { key: 'chandelier',      label: 'Chandelier (Lighting)'     },
  { key: 'pendant',         label: 'Pendant Light (Lighting)'  },
  { key: 'recessedLight',   label: 'Recessed Light (Lighting)' },
  { key: 'ceilingFan',      label: 'Ceiling Fan (Lighting)'    },
  { key: 'deskLamp',        label: 'Desk Lamp (Lighting)'      },
  { key: 'wallSconce',      label: 'Wall Sconce (Lighting)'    },
  { key: 'rug',             label: 'Rug (Textiles)'            },
  { key: 'throwPillow',     label: 'Throw Pillow (Textiles)'   },
  { key: 'curtains',        label: 'Curtains (Textiles)'       },
  { key: 'runnerRug',       label: 'Runner Rug (Textiles)'     },
  { key: 'throwBlanket',    label: 'Throw Blanket (Textiles)'  },
  { key: 'plant',           label: 'Plant (Decor)'             },
  { key: 'vase',            label: 'Vase (Decor)'              },
  { key: 'candle',          label: 'Candle (Decor)'            },
  { key: 'sculpture',       label: 'Sculpture (Decor)'         },
  { key: 'bookStack',       label: 'Decorative Books (Decor)'  },
  { key: 'tray',            label: 'Decorative Tray (Decor)'   },
  { key: 'diffuser',        label: 'Diffuser (Decor)'          },
  { key: 'wallDecal',       label: 'Wall Decal (Decor)'        },
  { key: 'pictureFrame',    label: 'Picture Frame (Decor)'     },
  { key: 'terrarium',       label: 'Terrarium (Decor)'         },
  { key: 'barCart',         label: 'Bar Cart (Specialty)'      },
  { key: 'fireplace',       label: 'Fireplace (Specialty)'     },
  { key: 'fitnessEquipment',label: 'Fitness Equipment (Specialty)' },
  { key: 'window',          label: 'Window (Structural)'       },
].sort((a, b) => a.label.localeCompare(b.label))

const STYLE_TAGS = ['Modern','Scandinavian','Bohemian','Dark Academia','Maximalist','Minimalist',
  'Cottagecore','Industrial','Glam','Transitional','Art Deco','Mid-Century Modern','Rustic','Coastal']
const ROOM_TAGS  = ['Living Room','Bedroom','Dining Room','Office',"Kids' Room",'Bathroom','Entryway','Kitchen','Outdoor']
const THEME_TAGS = ['Cozy','Nature','Moody','Bright','Colorful','Earthy','Luxe','Playful','Vintage','Zen','Bold','Calm']

export default function Step5Tags({ form, update }) {
  const t = useTheme()
  const s = styles(t)

  function toggle(key, arr, setKey) {
    const next = arr.includes(key) ? arr.filter(x => x !== key) : [...arr, key]
    update({ [setKey]: next })
  }

  return (
    <Card t={t}>
      <h3 style={s.title}>Room Builder Tags</h3>
      <p style={s.hint}>Connect this product to the 3D room builder so shoppers can place it in their room.</p>

      <Field t={t} label="Matches room builder item type">
        <select style={s.input} value={form.typeKey} onChange={e => update({ typeKey: e.target.value })}>
          <option value="">— No room builder link —</option>
          {CATALOGUE_OPTIONS.map(opt => (
            <option key={opt.key} value={opt.key}>{opt.label}</option>
          ))}
        </select>
        <p style={s.fieldNote}>Shoppers can place this product in their room design when a type is selected.</p>
      </Field>

      <Field t={t} label="Style tags">
        <ChipSelect options={STYLE_TAGS} selected={form.styleTags}
          onToggle={v => toggle(v, form.styleTags, 'styleTags')} t={t} />
      </Field>

      <Field t={t} label="Room tags">
        <ChipSelect options={ROOM_TAGS} selected={form.roomTags}
          onToggle={v => toggle(v, form.roomTags, 'roomTags')} t={t} />
      </Field>

      <Field t={t} label="Vibe / theme tags">
        <ChipSelect options={THEME_TAGS} selected={form.themeTags}
          onToggle={v => toggle(v, form.themeTags, 'themeTags')} t={t} />
      </Field>
    </Card>
  )
}

function ChipSelect({ options, selected, onToggle, t }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {options.map(opt => {
        const active = selected.includes(opt)
        return (
          <button key={opt} onClick={() => onToggle(opt)} style={{
            padding: '5px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
            fontWeight: active ? 600 : 400,
            background: active ? t.accent : 'transparent',
            color: active ? t.accentText : t.textSoft,
            border: `1px solid ${active ? t.accent : t.surfaceBorder}`,
            transition: 'all 0.1s',
          }}>
            {opt}
          </button>
        )
      })}
    </div>
  )
}

function styles(t) {
  return {
    title:     { fontSize: 11, fontWeight: 700, color: t.accent, textTransform: 'uppercase', letterSpacing: '1px', margin: 0 },
    hint:      { fontSize: 13, color: t.textSoft, margin: 0 },
    fieldNote: { fontSize: 11, color: t.textSoft, margin: '4px 0 0' },
    input:     { padding: '9px 11px', background: t.bg || '#f7faf4', border: `1px solid ${t.surfaceBorder}`, borderRadius: 8, color: t.text, fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box' },
  }
}
