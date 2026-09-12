import { Link } from '@adonisjs/inertia/react'

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-primary text-sm font-medium">404</p>
      <h1 className="text-3xl font-semibold tracking-tight">Page not found</h1>
      <p className="text-muted-foreground max-w-md">
        The page you are looking for doesn&apos;t exist or has been moved.
      </p>
      <Link route="home" className={cn(buttonVariants())}>
        Back to home
      </Link>
    </div>
  )
}
