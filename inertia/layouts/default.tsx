import { type Data } from '@generated/data'
import { toast } from 'sonner'
import { usePage } from '@inertiajs/react'
import { type ReactElement, useEffect } from 'react'

import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/theme_provider'

/**
 * Root layout wrapping every Inertia page. It only owns cross-cutting
 * concerns (theme, flash toasts). Page-level chrome lives in the
 * dedicated layouts under "~/layouts" (marketing / auth / app).
 */
export default function Layout({ children }: { children: ReactElement<Data.SharedProps> }) {
  const { url, flash } = usePage()

  useEffect(() => {
    toast.dismiss()
  }, [url])

  useEffect(() => {
    if (flash.error) toast.error(flash.error)
    if (flash.success) toast.success(flash.success)
  })

  return (
    <ThemeProvider>
      {children}
      <Toaster />
    </ThemeProvider>
  )
}
