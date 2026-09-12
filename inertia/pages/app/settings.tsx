import { MonitorIcon, MoonIcon, SunIcon } from 'lucide-react'
import { router } from '@inertiajs/react'

import AppLayout from '@/layouts/app_layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { useTheme } from '@/components/theme_provider'
import { cn } from '@/lib/utils'

const themeOptions = [
  { value: 'light', label: 'Light', icon: SunIcon },
  { value: 'dark', label: 'Dark', icon: MoonIcon },
  { value: 'system', label: 'System', icon: MonitorIcon },
] as const

const notifications = [
  { id: 'deploys', label: 'Deployment updates', desc: 'When a deploy starts, succeeds or fails.' },
  { id: 'incidents', label: 'Incident alerts', desc: 'When a server goes offline or degrades.' },
  { id: 'digest', label: 'Weekly digest', desc: 'A Monday summary of your fleet.' },
]

export default function Settings() {
  const { theme, setTheme } = useTheme()

  return (
    <AppLayout title="Settings" description="Manage how Influx looks and talks to you.">
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Choose a theme for the interface.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3">
              {themeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setTheme(option.value)}
                  className={cn(
                    'flex items-center gap-2 rounded-lg border p-4 text-sm font-medium transition-colors',
                    theme === option.value
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'hover:bg-accent'
                  )}
                >
                  <option.icon className="size-4" />
                  {option.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Pick what you want to hear about by email.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {notifications.map((item, i) => (
              <div key={item.id}>
                {i > 0 && <Separator className="mb-4" />}
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <Label htmlFor={item.id}>{item.label}</Label>
                    <p className="text-muted-foreground text-sm">{item.desc}</p>
                  </div>
                  <Switch id={item.id} defaultChecked={i < 2} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle className="text-destructive">Danger zone</CardTitle>
            <CardDescription>End your session on this device.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={() => router.post('/logout')}>
              Log out
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
