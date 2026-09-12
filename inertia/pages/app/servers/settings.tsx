import { Form, Link } from '@adonisjs/inertia/react'

import ServerLayout from '@/layouts/server_layout'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ServerFormFields, type ServerRecord } from '@/components/server_form_fields'
import { AgentCard } from '@/components/metrics/agent_card'
import { cn } from '@/lib/utils'

export default function ServerSettings({
  server,
  agentKey,
  retentionDays,
  reportCount,
}: {
  server: ServerRecord
  agentKey: string | null
  retentionDays: number
  reportCount: number
}) {
  return (
    <ServerLayout server={server}>
      <div className="grid max-w-2xl gap-6">
        <AgentCard
          server={server}
          agentKey={agentKey}
          retentionDays={retentionDays}
          reportCount={reportCount}
        />

        <Card>
          <CardHeader>
            <CardTitle>Server details</CardTitle>
            <CardDescription>Update how {server.name} is identified and monitored.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form
              route="servers.update"
              routeParams={{ id: server.id }}
              className="flex flex-col gap-4"
            >
              {({ errors, processing }) => (
                <>
                  <ServerFormFields server={server} errors={errors as Record<string, string>} />
                  <div>
                    <Button type="submit" disabled={processing}>
                      Save changes
                    </Button>
                  </div>
                </>
              )}
            </Form>
          </CardContent>
        </Card>

        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle>Danger zone</CardTitle>
            <CardDescription>
              Removing a server deletes its monitoring configuration and history.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form route="servers.destroy" routeParams={{ id: server.id }}>
              {({ processing }) => (
                <div className="flex items-center gap-3">
                  <Button type="submit" variant="destructive" disabled={processing}>
                    Delete server
                  </Button>
                  <Link
                    route="servers.show"
                    routeParams={{ id: server.id }}
                    className={cn(buttonVariants({ variant: 'ghost' }))}
                  >
                    Cancel
                  </Link>
                </div>
              )}
            </Form>
          </CardContent>
        </Card>
      </div>
    </ServerLayout>
  )
}
