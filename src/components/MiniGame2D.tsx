import { useEffect, useRef, useState } from 'react'

export default function MiniGame2D() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [score, setScore] = useState(0)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    if (!running || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = canvas.width
    const h = canvas.height

    let playerX = w / 2
    const playerY = h - 30
    const playerSize = 16
    let localScore = 0
    let gameOver = false
    const keys = new Set<string>()
    const obstacles: { x: number; y: number; s: number; v: number }[] = []

    const onKeyDown = (e: KeyboardEvent) => keys.add(e.key)
    const onKeyUp = (e: KeyboardEvent) => keys.delete(e.key)

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)

    const spawn = () => {
      obstacles.push({ x: Math.random() * (w - 20), y: -20, s: 12 + Math.random() * 16, v: 1.3 + Math.random() * 1.7 })
    }

    let lastSpawn = 0

    const frame = (t: number) => {
      if (gameOver) return

      if (keys.has('ArrowLeft') || keys.has('a')) playerX -= 3.5
      if (keys.has('ArrowRight') || keys.has('d')) playerX += 3.5
      playerX = Math.max(8, Math.min(w - 8, playerX))

      if (t - lastSpawn > 450) {
        spawn()
        lastSpawn = t
      }

      ctx.fillStyle = '#071019'
      ctx.fillRect(0, 0, w, h)

      ctx.strokeStyle = '#204053'
      for (let i = 0; i <= 10; i++) {
        ctx.beginPath()
        ctx.moveTo(0, (h / 10) * i)
        ctx.lineTo(w, (h / 10) * i)
        ctx.stroke()
      }

      ctx.fillStyle = '#7fd2ff'
      ctx.fillRect(playerX - playerSize / 2, playerY - playerSize / 2, playerSize, playerSize)

      for (let i = obstacles.length - 1; i >= 0; i--) {
        const o = obstacles[i]
        o.y += o.v

        ctx.fillStyle = '#ff7e9c'
        ctx.fillRect(o.x, o.y, o.s, o.s)

        const hit =
          playerX + playerSize / 2 > o.x &&
          playerX - playerSize / 2 < o.x + o.s &&
          playerY + playerSize / 2 > o.y &&
          playerY - playerSize / 2 < o.y + o.s

        if (hit) {
          gameOver = true
          setRunning(false)
          return
        }

        if (o.y > h + 30) {
          obstacles.splice(i, 1)
          localScore += 10
          setScore(localScore)
        }
      }

      requestAnimationFrame(frame)
    }

    requestAnimationFrame(frame)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [running])

  return (
    <div className="game-box">
      <h4>2D: Signal Drift Escape</h4>
      <p>Steuerung: ← → oder A/D. Weiche den Störsignalen aus.</p>
      <div className="game-meta">Score: {score}</div>
      <canvas ref={canvasRef} width={620} height={250} className="viz-surface" />
      <button onClick={() => {
        if (!running) setScore(0)
        setRunning((v) => !v)
      }}>{running ? 'Pause' : 'Start / Restart'}</button>
    </div>
  )
}
