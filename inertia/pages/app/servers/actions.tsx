import { ZapIcon } from 'lucide-react'

import ServerLayout from '@/layouts/server_layout'
import { PlaceholderPanel } from '@/components/placeholder_panel'
import { type ServerRecord } from '@/components/server_form_fields'

export default function ServerActions({ server }: { server: ServerRecord }) {
  return (
    <ServerLayout server={server}>
      <PlaceholderPanel icon={ZapIcon} title="Actions & automation">
        On-demand and automated operations for {server.name}: run a check now, pause monitoring,
        mute alerts for a window, and trigger webhooks or scripts in response to state changes.
      </PlaceholderPanel>
    </ServerLayout>
  )
}
