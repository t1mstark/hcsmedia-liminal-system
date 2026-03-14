import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

export default function MiniGame3D() {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const [distance, setDistance] = useState(0)

  useEffect(() => {
    if (!mountRef.current) return

    const width = 620
    const height = 260
    const mountEl = mountRef.current

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#060f16')

    const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 100)
    camera.position.set(0, 1.5, 6)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    mountEl.innerHTML = ''
    mountEl.appendChild(renderer.domElement)

    const light = new THREE.PointLight('#8fd9ff', 2.2)
    light.position.set(0, 3, 4)
    scene.add(light)

    const ambient = new THREE.AmbientLight('#6ca4c0', 0.55)
    scene.add(ambient)

    const corridor = new THREE.Group()
    for (let i = 0; i < 18; i++) {
      const geo = new THREE.BoxGeometry(5, 2.8, 0.08)
      const mat = new THREE.MeshStandardMaterial({ color: i % 2 ? '#13212e' : '#0e1a25', emissive: '#102030', emissiveIntensity: 0.3 })
      const ring = new THREE.Mesh(geo, mat)
      ring.position.z = -i * 1.4
      scene.add(ring)
      corridor.add(ring)
    }

    const player = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.4, 0.4),
      new THREE.MeshStandardMaterial({ color: '#7cffc4', emissive: '#2b8c67', emissiveIntensity: 0.4 }),
    )
    player.position.set(0, 0.2, 0)
    scene.add(player)

    const blockers: THREE.Mesh[] = []
    for (let i = 0; i < 12; i++) {
      const m = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 0.7, 0.7),
        new THREE.MeshStandardMaterial({ color: '#ff7e9c', emissive: '#7f2d4d', emissiveIntensity: 0.4 }),
      )
      m.position.set((Math.random() - 0.5) * 3, 0.2, -6 - i * 3)
      blockers.push(m)
      scene.add(m)
    }

    const keys = new Set<string>()
    const onDown = (e: KeyboardEvent) => keys.add(e.key)
    const onUp = (e: KeyboardEvent) => keys.delete(e.key)
    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)

    let d = 0
    let frameId = 0

    const loop = () => {
      if (keys.has('ArrowLeft') || keys.has('a')) player.position.x -= 0.06
      if (keys.has('ArrowRight') || keys.has('d')) player.position.x += 0.06
      player.position.x = Math.max(-1.8, Math.min(1.8, player.position.x))

      d += 0.02
      setDistance(Math.floor(d * 100))

      corridor.children.forEach((c) => {
        c.position.z += 0.06
        if (c.position.z > 2) c.position.z = -24
      })

      blockers.forEach((b) => {
        b.position.z += 0.11
        if (b.position.z > 2) {
          b.position.z = -30 - Math.random() * 8
          b.position.x = (Math.random() - 0.5) * 3
        }

        if (Math.abs(b.position.z - player.position.z) < 0.45 && Math.abs(b.position.x - player.position.x) < 0.5) {
          d = 0
          player.position.x = 0
        }
      })

      renderer.render(scene, camera)
      frameId = requestAnimationFrame(loop)
    }

    frameId = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
      renderer.dispose()
      mountEl.replaceChildren()
    }
  }, [])

  return (
    <div className="game-box">
      <h4>3D: Liminal Tunnel Runner</h4>
      <p>Weiche den Blöcken aus. Kollision setzt Distanz zurück.</p>
      <div className="game-meta">Distance: {distance}m</div>
      <div ref={mountRef} className="viz-surface" />
    </div>
  )
}
