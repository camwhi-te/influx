type SparklineProps = {
  values: (number | null)[]
  color?: string
  width?: number
  height?: number
  min?: number
  max?: number
  className?: string
}

/** Dependency-free trend line for stat tiles. */
export function Sparkline({
  values,
  color = 'var(--chart-1)',
  width = 120,
  height = 32,
  min,
  max,
  className,
}: SparklineProps) {
  const nums = values.filter((v): v is number => typeof v === 'number')
  if (nums.length < 2) {
    return <svg width={width} height={height} className={className} aria-hidden />
  }

  const lo = min ?? Math.min(...nums)
  const hi = max ?? Math.max(...nums)
  const span = hi - lo || 1
  const step = width / (values.length - 1)

  let d = ''
  let started = false
  values.forEach((v, i) => {
    if (typeof v !== 'number') {
      started = false
      return
    }
    const x = i * step
    const y = height - ((v - lo) / span) * (height - 2) - 1
    d += `${started ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)} `
    started = true
  })

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      preserveAspectRatio="none"
      aria-hidden
    >
      <path d={d.trim()} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
    </svg>
  )
}
