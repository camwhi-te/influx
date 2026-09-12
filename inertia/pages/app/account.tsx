import { usePage, router } from '@inertiajs/react'

import AppLayout from '@/layouts/app_layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export default function Account() {
  const user = usePage().props.user

  if (!user) return null

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '—'

  return (
    <AppLayout title="Account" description="Your personal details and profile information.">
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>This information is visible across your workspace.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="flex items-center gap-4">
              <Avatar className="size-14 text-base">
                <AvatarFallback>{user.initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate font-medium">{user.fullName ?? 'Unnamed user'}</p>
                <p className="text-muted-foreground truncate text-sm">{user.email}</p>
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input id="fullName" defaultValue={user.fullName ?? ''} disabled />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue={user.email} disabled />
              </div>
            </div>
            <p className="text-muted-foreground text-xs">
              Editing your profile will be available soon.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account details</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">User ID</span>
              <span className="font-mono">{user.id}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Member since</span>
              <span>{memberSince}</span>
            </div>
            <Separator className="my-1" />
            <Button variant="outline" className="w-full" onClick={() => router.post('/logout')}>
              Sign out
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
