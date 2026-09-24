"use client"

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { cn } from "@/lib/utils"

interface FlickeringGridProps extends React.HTMLAttributes<HTMLDivElement> {
  squareSize?: number
  gridGap?: number
  flickerChance?: number
  color?: string
  width?: number
  height?: number
  className?: string
  maxOpacity?: number
  /** Extra colors a few squares take on, e.g. theme variables. */
  accentColors?: string[]
  /** Chance (0-1) that a square uses an accent color each time it flickers. */
  accentChance?: number
}

const toRGBA = (colorValue: string) => {
  if (typeof window === "undefined") {
    return `rgba(0, 0, 0,`
  }
  const canvas = document.createElement("canvas")
  canvas.width = canvas.height = 1
  const ctx = canvas.getContext("2d")
  if (!ctx) return "rgba(255, 0, 0,"
  ctx.fillStyle = colorValue
  ctx.fillRect(0, 0, 1, 1)
  const [r, g, b] = Array.from(ctx.getImageData(0, 0, 1, 1).data)
  return `rgba(${r}, ${g}, ${b},`
}

export const FlickeringGrid: React.FC<FlickeringGridProps> = ({
  squareSize = 4,
  gridGap = 6,
  flickerChance = 0.3,
  color,
  width,
  height,
  className,
  maxOpacity = 0.3,
  accentColors,
  accentChance = 0,
  ...props
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isInView, setIsInView] = useState(false)
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })
  const [resolvedColor, setResolvedColor] = useState<string>("rgb(0, 0, 0)")
  const [resolvedAccents, setResolvedAccents] = useState<string[]>([])
  const accentKey = accentColors?.join("|") ?? ""
  const accentCount = accentColors?.length ?? 0

  const resolveColor = useCallback((colorValue: string | undefined): string => {
    if (typeof window === "undefined") {
      return "rgb(0, 0, 0)"
    }

    const colorToResolve = colorValue || "var(--foreground)"

    if (colorToResolve.startsWith("var(")) {
      const tempEl = document.createElement("div")
      tempEl.style.color = colorToResolve
      tempEl.style.position = "absolute"
      tempEl.style.visibility = "hidden"
      document.body.appendChild(tempEl)
      const computedColor = window.getComputedStyle(tempEl).color
      document.body.removeChild(tempEl)
      return computedColor || "rgb(0, 0, 0)"
    }

    return colorToResolve
  }, [])

  useEffect(() => {
    const updateColor = () => {
      const resolved = resolveColor(color)
      setResolvedColor(resolved)
      setResolvedAccents(accentKey ? accentKey.split("|").map(resolveColor) : [])
    }

    updateColor()

    const observer = new MutationObserver(() => {
      updateColor()
    })

    if (typeof window !== "undefined") {
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      })
    }

    return () => {
      observer.disconnect()
    }
  }, [color, accentKey, resolveColor])

  const memoizedColor = useMemo(() => toRGBA(resolvedColor), [resolvedColor])
  const memoizedAccents = useMemo(() => resolvedAccents.map(toRGBA), [resolvedAccents])

  // 0 = base color, n = accentColors[n - 1]
  const rollTint = useCallback(
    () =>
      accentCount > 0 && Math.random() < accentChance
        ? 1 + Math.floor(Math.random() * accentCount)
        : 0,
    [accentChance, accentCount]
  )

  const setupCanvas = useCallback(
    (canvas: HTMLCanvasElement, width: number, height: number) => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      const cols = Math.floor(width / (squareSize + gridGap))
      const rows = Math.floor(height / (squareSize + gridGap))

      const squares = new Float32Array(cols * rows)
      const tints = new Uint8Array(cols * rows)
      for (let i = 0; i < squares.length; i++) {
        squares[i] = Math.random() * maxOpacity
        tints[i] = rollTint()
      }

      return { cols, rows, squares, tints, dpr }
    },
    [squareSize, gridGap, maxOpacity, rollTint]
  )

  const updateSquares = useCallback(
    (squares: Float32Array, tints: Uint8Array, deltaTime: number) => {
      for (let i = 0; i < squares.length; i++) {
        if (Math.random() < flickerChance * deltaTime) {
          squares[i] = Math.random() * maxOpacity
          tints[i] = rollTint()
        }
      }
    },
    [flickerChance, maxOpacity, rollTint]
  )

  const drawGrid = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number,
      cols: number,
      rows: number,
      squares: Float32Array,
      tints: Uint8Array,
      dpr: number
    ) => {
      ctx.clearRect(0, 0, width, height)
      ctx.fillStyle = "transparent"
      ctx.fillRect(0, 0, width, height)

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const index = i * rows + j
          const tint = tints[index]
          const accent = tint > 0 ? memoizedAccents[tint - 1] : undefined
          // Accents get a small opacity lift so the hue reads at low alpha.
          ctx.fillStyle = accent
            ? `${accent}${Math.min(1, squares[index] * 2.2)})`
            : `${memoizedColor}${squares[index]})`
          ctx.fillRect(
            i * (squareSize + gridGap) * dpr,
            j * (squareSize + gridGap) * dpr,
            squareSize * dpr,
            squareSize * dpr
          )
        }
      }
    },
    [memoizedColor, memoizedAccents, squareSize, gridGap]
  )

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number
    let gridParams: ReturnType<typeof setupCanvas>

    const updateCanvasSize = () => {
      const newWidth = width || container.clientWidth
      const newHeight = height || container.clientHeight
      setCanvasSize({ width: newWidth, height: newHeight })
      gridParams = setupCanvas(canvas, newWidth, newHeight)
    }

    updateCanvasSize()

    let lastTime = 0
    const animate = (time: number) => {
      if (!isInView) return

      const deltaTime = (time - lastTime) / 1000
      lastTime = time

      updateSquares(gridParams.squares, gridParams.tints, deltaTime)
      drawGrid(
        ctx,
        canvas.width,
        canvas.height,
        gridParams.cols,
        gridParams.rows,
        gridParams.squares,
        gridParams.tints,
        gridParams.dpr
      )
      animationFrameId = requestAnimationFrame(animate)
    }

    const resizeObserver = new ResizeObserver(() => {
      updateCanvasSize()
    })

    resizeObserver.observe(container)

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting)
      },
      { threshold: 0 }
    )

    intersectionObserver.observe(canvas)

    if (isInView) {
      animationFrameId = requestAnimationFrame(animate)
    }

    return () => {
      cancelAnimationFrame(animationFrameId)
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
    }
  }, [setupCanvas, updateSquares, drawGrid, width, height, isInView])

  return (
    <div
      ref={containerRef}
      className={cn(`h-full w-full ${className}`)}
      {...props}
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-none"
        style={{
          width: canvasSize.width,
          height: canvasSize.height,
        }}
      />
    </div>
  )
}

