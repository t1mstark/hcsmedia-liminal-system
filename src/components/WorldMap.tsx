type Place = {
  id: string
  title: string
  coords: [number, number]
  signalStrength: number
}

type Props = {
  places: Place[]
  selectedId?: string
  onSelect?: (id: string) => void
}

const project = ([lat, lon]: [number, number], width: number, height: number) => {
  const x = ((lon + 180) / 360) * width
  const y = ((90 - lat) / 180) * height
  return [x, y]
}

export default function WorldMap({ places, selectedId, onSelect }: Props) {
  const w = 740
  const h = 360

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="viz-surface">
      <rect x="0" y="0" width={w} height={h} fill="#071018" stroke="#223645" />
      {[...Array(11)].map((_, i) => (
        <line key={`h-${i}`} x1="0" y1={(h / 10) * i} x2={w} y2={(h / 10) * i} stroke="#172734" strokeWidth="0.6" />
      ))}
      {[...Array(19)].map((_, i) => (
        <line key={`v-${i}`} y1="0" x1={(w / 18) * i} y2={h} x2={(w / 18) * i} stroke="#172734" strokeWidth="0.6" />
      ))}

      {places.map((p) => {
        const [x, y] = project(p.coords, w, h)
        const selected = p.id === selectedId
        return (
          <g key={p.id} onClick={() => onSelect?.(p.id)} style={{ cursor: 'pointer' }}>
            <circle cx={x} cy={y} r={selected ? 7 : 5} fill={selected ? '#7cffc4' : '#7fd2ff'} opacity="0.9" />
            <circle cx={x} cy={y} r={12 + p.signalStrength / 15} fill="none" stroke="#7fd2ff" opacity="0.25" />
            <text x={x + 8} y={y - 8} fill="#acc2d0" fontSize="10">{p.title}</text>
          </g>
        )
      })}
    </svg>
  )
}
