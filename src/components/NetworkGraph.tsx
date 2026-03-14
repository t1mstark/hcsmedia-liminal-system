import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

type Place = {
  id: string
  title: string
  signalStrength: number
  archiveRefs: string[]
}

type Doc = { id: string; title: string }

type Props = {
  places: Place[]
  docs: Doc[]
}

type NodeDatum = d3.SimulationNodeDatum & {
  id: string
  label: string
  group: 'place' | 'doc' | 'signal'
}

type LinkDatum = d3.SimulationLinkDatum<NodeDatum> & {
  source: string | NodeDatum
  target: string | NodeDatum
}

const toNode = (n: string | NodeDatum): NodeDatum => (typeof n === 'string' ? { id: n, label: n, group: 'doc' } : n)

export default function NetworkGraph({ places, docs }: Props) {
  const ref = useRef<SVGSVGElement | null>(null)

  useEffect(() => {
    if (!ref.current) return

    const width = 720
    const height = 320

    const signalNodes: NodeDatum[] = places.map((p) => ({
      id: `SIG-${p.id}`,
      label: `S ${p.signalStrength}%`,
      group: 'signal',
    }))

    const nodes: NodeDatum[] = [
      ...places.map((p) => ({ id: p.id, label: p.title, group: 'place' as const })),
      ...docs.map((d) => ({ id: d.id, label: d.title, group: 'doc' as const })),
      ...signalNodes,
    ]

    const links: LinkDatum[] = [
      ...places.flatMap((p) => p.archiveRefs.map((r) => ({ source: p.id, target: r }))),
      ...places.map((p) => ({ source: p.id, target: `SIG-${p.id}` })),
    ]

    const svg = d3.select(ref.current)
    svg.selectAll('*').remove()

    const sim = d3
      .forceSimulation(nodes)
      .force('link', d3.forceLink<NodeDatum, LinkDatum>(links).id((d) => d.id).distance(50))
      .force('charge', d3.forceManyBody().strength(-140))
      .force('center', d3.forceCenter(width / 2, height / 2))

    const link = svg
      .append('g')
      .attr('stroke', '#385468')
      .attr('stroke-opacity', 0.7)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', 1)

    const node = svg
      .append('g')
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', (d) => (d.group === 'place' ? 5 : d.group === 'signal' ? 4 : 3.5))
      .attr('fill', (d) => (d.group === 'place' ? '#7fd2ff' : d.group === 'signal' ? '#7cffc4' : '#9fa6ad'))

    const label = svg
      .append('g')
      .selectAll('text')
      .data(nodes)
      .join('text')
      .text((d) => d.label)
      .attr('font-size', 9)
      .attr('fill', '#a9c0cf')

    sim.on('tick', () => {
      link
        .attr('x1', (d) => toNode(d.source).x ?? 0)
        .attr('y1', (d) => toNode(d.source).y ?? 0)
        .attr('x2', (d) => toNode(d.target).x ?? 0)
        .attr('y2', (d) => toNode(d.target).y ?? 0)

      node.attr('cx', (d) => d.x ?? 0).attr('cy', (d) => d.y ?? 0)
      label.attr('x', (d) => (d.x ?? 0) + 7).attr('y', (d) => (d.y ?? 0) + 3)
    })

    return () => {
      sim.stop()
    }
  }, [places, docs])

  return <svg ref={ref} width="100%" viewBox="0 0 720 320" className="viz-surface" />
}
