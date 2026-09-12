import { Link } from '@adonisjs/inertia/react'

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function ServerError() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-destructive text-sm font-medium">500</p>
      <h1 className="text-3xl font-semibold tracking-tight">Something went wrong</h1>
      <p className="text-muted-foreground max-w-md">
        An unexpected error occurred on our end. Please try again in a moment.
      </p>
      <Link route="home" className={cn(buttonVariants())}>
        Back to home
      </Link>
    </div>
  )
}
