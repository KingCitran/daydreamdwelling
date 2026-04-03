import { Text, Billboard } from '@react-three/drei'
import { ITEM_CATALOGUE } from '../data/items'

const WALL_T = 0.28

export default function Measurements({ gridW, gridD, wallHeight, items, selectedId }) {
  const hw = gridW / 2
  const hd = gridD / 2
  const y  = 0.02  // just above the floor surface

  let itemMark = null
  const sel = items?.find(it => it.id === selectedId) ?? null
  if (sel) {
    const def  = ITEM_CATALOGUE[sel.typeKey]
    const size = def.sizes[sel.sizeIndex]
    const fw   = sel.customW ?? size.footprint[0]
    const fd   = size.footprint[1]
    const fh   = sel.customH ?? size.height

    if (sel.wall) {
      // Wall item — reconstruct approximate world position from wall params
      const u      = sel.wallU ?? 0
      const wh     = sel.wallH ?? 1
      const anchor = sel.wallAnchor
      const OFFSET = (def.window || def.door) ? 0 : WALL_T / 2 + fd / 2

      let ix, iy, iz
      if (sel.wall === 'N') {
        const row = anchor ?? 0
        ix = u - gridW / 2
        iz = (row - gridD / 2) + OFFSET + 0.55
        iy = wh + fh / 2 + 0.5
      } else if (sel.wall === 'S') {
        const row = anchor ?? (gridD - 1)
        ix = u - gridW / 2
        iz = (row + 1 - gridD / 2) - OFFSET - 0.55
        iy = wh + fh / 2 + 0.5
      } else if (sel.wall === 'W') {
        const col = anchor ?? 0
        ix = (col - gridW / 2) + OFFSET + 0.55
        iz = u - gridD / 2
        iy = wh + fh / 2 + 0.5
      } else { // E
        const col = anchor ?? (gridW - 1)
        ix = (col + 1 - gridW / 2) - OFFSET - 0.55
        iz = u - gridD / 2
        iy = wh + fh / 2 + 0.5
      }
      itemMark = {
        x: ix, y: iy, z: iz,
        text: `${fw} × ${fh} ft`,
      }
    } else if (sel.ceiling) {
      // Ceiling item — label below the fixture
      const dropLength = sel.dropLength ?? 0.6
      itemMark = {
        x: (sel.col + fw / 2) - gridW / 2,
        y: wallHeight - dropLength - fh / 2 - 0.4,
        z: (sel.row + fd / 2) - gridD / 2,
        text: `${fw} × ${fd} ft  drop: ${dropLength.toFixed(1)} ft`,
      }
    } else {
      // Floor item
      const rotated = sel.rotation === 90 || sel.rotation === 270
      const ew = rotated ? fd : fw
      const ed = rotated ? fw : fd
      itemMark = {
        x: (sel.col + ew / 2) - gridW / 2,
        y: fh + 0.45,
        z: (sel.row + ed / 2) - gridD / 2,
        text: `${ew} × ${ed} ft  h: ${fh} ft`,
      }
    }
  }

  return (
    <group>
      {/* Room width — front edge */}
      <Text
        position={[0, y, hd + 0.55]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.42}
        color="#e0d9ff"
        outlineWidth={0.025}
        outlineColor="#1a1a2e"
        anchorX="center"
        anchorY="middle"
      >
        {`${gridW} ft`}
      </Text>

      {/* Room depth — right edge */}
      <Text
        position={[hw + 0.55, y, 0]}
        rotation={[-Math.PI / 2, 0, -Math.PI / 2]}
        fontSize={0.42}
        color="#e0d9ff"
        outlineWidth={0.025}
        outlineColor="#1a1a2e"
        anchorX="center"
        anchorY="middle"
      >
        {`${gridD} ft`}
      </Text>

      {/* Selected item — Billboard keeps text facing camera */}
      {itemMark && (
        <Billboard position={[itemMark.x, itemMark.y, itemMark.z]}>
          <Text
            fontSize={0.38}
            color="#ffd080"
            outlineWidth={0.03}
            outlineColor="#1a1a2e"
            anchorX="center"
            anchorY="middle"
          >
            {itemMark.text}
          </Text>
        </Billboard>
      )}
    </group>
  )
}
