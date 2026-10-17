import confetti from 'canvas-confetti'
import { QRCodeSVG } from 'qrcode.react'
import { useEffect, useImperativeHandle, useRef, useState, type Ref } from 'react'
import type { ScreenConfig } from './schema'
import { palettes } from './schema'

export type StageHandle = { celebrate: () => void }

export function QrStage({ config, value, preview = false, ref }: {
  config: ScreenConfig
  value: string
  preview?: boolean
  ref?: Ref<StageHandle>
}) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const party = useRef<ReturnType<typeof confetti.create> | null>(null)
  const [celebration, setCelebration] = useState(0)

  useEffect(() => {
    const instance = confetti.create(canvas.current!, { resize: true })
    party.current = instance
    return () => { instance.reset(); party.current = null }
  }, [])

  useImperativeHandle(ref, () => ({
    celebrate() {
      const options = {
        particleCount: config.amount,
        spread: 65,
        startVelocity: preview ? 32 : 55,
        gravity: 0.95,
        ticks: 240,
        scalar: preview ? 0.75 : 1.1,
        colors: palettes[config.confetti],
        disableForReducedMotion: true,
      }
      party.current?.({ ...options, angle: 58, origin: { x: 0, y: 1 } })
      party.current?.({ ...options, angle: 122, origin: { x: 1, y: 1 } })
      setCelebration((count) => count + 1)
    },
  }))

  return (
    <section className={'qr-stage theme-' + config.theme + (preview ? ' is-preview' : '')} aria-label="QRコード表示">
      <div className="stage-topline"><span className="stage-wordmark">QR Pop<span>✳</span></span><span>SCAN & CELEBRATE</span></div>
      <div className="stage-center">
        <span className="stage-eyebrow">A LITTLE SCAN. A LITTLE JOY.</span>
        <h2>{config.title || 'つながる、その瞬間を。'}</h2>
        <div className="qr-composition">
          <span className="stage-spark spark-one" aria-hidden="true">✳</span>
          <span className="stage-spark spark-two" aria-hidden="true">✦</span>
          <span className="stage-spark spark-three" aria-hidden="true">✺</span>
          <div className="qr-paper">
            <QRCodeSVG value={value} size={400} level="M" marginSize={4} title="スマートフォンのカメラで読み取ってください" />
          </div>
          {celebration > 0 && <span key={celebration} className="scan-thanks" role="status">ありがとう！<span aria-hidden="true"> ✨</span></span>}
        </div>
        <p className="stage-message">{config.message}</p>
      </div>
      <div className="stage-bottomline"><span>スマートフォンのカメラでスキャン</span><span aria-hidden="true">↗</span></div>
      <canvas className="confetti-canvas" aria-hidden="true" ref={canvas} />
    </section>
  )
}
