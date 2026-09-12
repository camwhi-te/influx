import { router } from '@inertiajs/react'

import { cn } from '@/lib/utils'
import type { MetricRange, RangeOption } from '@/lib/metrics'

/** Range switcher that reloads the page with `?range=` (partial, scroll-preserving). */
export function RangeTabs({
  value,
  options,
  only,
}: {
  value: MetricRange
  options: RangeOption[]
  only?: string[]
}) {
  return (
    <div className="border-input inline-flex flex-wrap rounded-md border p-0.5">
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() =>
              router.get(
                window.location.pathname,
                { range: opt.value },
                { preserveScroll: true, preserveState: true, replace: true, only }
              )
            }
            className={cn(
              'rounded-[5px] px-2.5 py-1 text-xs font-medium transition-colors',
              active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
