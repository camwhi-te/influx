import { useState } from 'react'
import { PlusIcon, PencilIcon, Trash2Icon } from 'lucide-react'
import { Form, Link } from '@adonisjs/inertia/react'

import AppLayout from '@/layouts/app_layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'
import { ServerFormFields, type ServerRecord } from '@/components/server_form_fields'
import { cn } from '@/lib/utils'

const severityStyles: Record<string, string> = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  high: 'bg-destructive/15 text-destructive',
}

function Badge({ value, className }: { value: string; className?: string }) {
  return (
    <span
      className={cn(
        'inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize',
        className
      )}
    >
      {value}
    </span>
  )
}

type EditorState = { mode: 'create' } | null

function AddServerForm({ onDone }: { onDone: () => void }) {
  return (
    <Form route="servers.store" onSuccess={onDone} className="flex flex-1 flex-col">
      {({ errors, processing }) => (
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
          <ServerFormFields errors={errors as Record<string, string>} />
          <SheetFooter className="mt-auto px-0">
            <Button type="submit" disabled={processing}>
              Add server
            </Button>
            <Button type="button" variant="ghost" onClick={onDone}>
              Cancel
            </Button>
          </SheetFooter>
        </div>
      )}
    </Form>
  )
}

export default function Servers({ servers }: { servers: ServerRecord[] }) {
  const [editor, setEditor] = useState<EditorState>(null)

  return (
    <AppLayout
      title="Servers"
      description="Machines tracked for status monitoring."
      actions={
        <Button onClick={() => setEditor({ mode: 'create' })}>
          <PlusIcon />
          Add server
        </Button>
      }
    >
      {servers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <p className="text-muted-foreground text-sm">No servers yet.</p>
            <Button onClick={() => setEditor({ mode: 'create' })}>
              <PlusIcon />
              Add your first server
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Card list on small screens */}
          <div className="grid gap-4 md:hidden">
            {servers.map((server) => (
              <Card key={server.id}>
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle>
                      <Link
                        route="servers.show"
                        routeParams={{ id: server.id }}
                        className="hover:underline"
                      >
                        {server.name}
                      </Link>
                    </CardTitle>
                    <Badge value={server.severity} className={severityStyles[server.severity]} />
                  </div>
                </CardHeader>
                <CardContent className="text-muted-foreground grid grid-cols-2 gap-2 text-sm">
                  <span>Address</span>
                  <span className="text-foreground text-right font-mono">{server.address}</span>
                  <span>Location</span>
                  <span className="text-foreground text-right">{server.location}</span>
                  <span>Type</span>
                  <span className="text-foreground text-right capitalize">{server.type}</span>
                  <div className="col-span-2 mt-2 flex justify-end gap-2">
                    <Link
                      route="servers.settings"
                      routeParams={{ id: server.id }}
                      className={cn(
                        'inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-xs font-medium'
                      )}
                    >
                      <PencilIcon className="size-3.5" />
                      Edit
                    </Link>
                    <DeleteButton server={server} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Table on md+ */}
          <Card className="hidden overflow-hidden py-0 md:block">
            <div className="w-full overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-muted-foreground text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Address</th>
                    <th className="px-4 py-3 font-medium">Location</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Severity</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-border divide-y">
                  {servers.map((server) => (
                    <tr key={server.id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-4 py-3 font-medium">
                        <Link
                          route="servers.show"
                          routeParams={{ id: server.id }}
                          className="hover:underline"
                        >
                          {server.name}
                        </Link>
                      </td>
                      <td className="text-muted-foreground px-4 py-3 font-mono">
                        {server.address}
                      </td>
                      <td className="text-muted-foreground px-4 py-3">{server.location}</td>
                      <td className="text-muted-foreground px-4 py-3 capitalize">{server.type}</td>
                      <td className="px-4 py-3">
                        <Badge
                          value={server.severity}
                          className={severityStyles[server.severity]}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            route="servers.settings"
                            routeParams={{ id: server.id }}
                            className="inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-xs font-medium"
                          >
                            <PencilIcon className="size-3.5" />
                            Edit
                          </Link>
                          <DeleteButton server={server} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      <Sheet open={editor !== null} onOpenChange={(open) => !open && setEditor(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Add server</SheetTitle>
            <SheetDescription>Register a machine to monitor.</SheetDescription>
          </SheetHeader>
          {editor && <AddServerForm onDone={() => setEditor(null)} />}
        </SheetContent>
      </Sheet>
    </AppLayout>
  )
}

function DeleteButton({ server }: { server: ServerRecord }) {
  const [confirming, setConfirming] = useState(false)

  return (
    <Sheet open={confirming} onOpenChange={setConfirming}>
      <Button
        size="sm"
        variant="ghost"
        className="text-destructive hover:text-destructive"
        onClick={() => setConfirming(true)}
      >
        <Trash2Icon />
        Delete
      </Button>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Delete {server.name}?</SheetTitle>
          <SheetDescription>
            This permanently removes the server and its monitoring configuration.
          </SheetDescription>
        </SheetHeader>
        <Form
          route="servers.destroy"
          routeParams={{ id: server.id }}
          onSuccess={() => setConfirming(false)}
          className="flex flex-col gap-2 p-4"
        >
          {({ processing }) => (
            <>
              <Button type="submit" variant="destructive" disabled={processing}>
                Delete server
              </Button>
              <Button type="button" variant="ghost" onClick={() => setConfirming(false)}>
                Cancel
              </Button>
            </>
          )}
        </Form>
      </SheetContent>
    </Sheet>
  )
}
