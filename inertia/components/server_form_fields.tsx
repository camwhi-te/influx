import { type ReactNode } from 'react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export const SERVER_TYPES = ['http', 'ssh', 'game', 'dedicated', 'database', 'other']
export const SERVER_SEVERITIES = ['low', 'medium', 'high']

export type AgentState = 'unpaired' | 'online' | 'stale' | 'offline'

export type ServerRecord = {
  id: number
  name: string
  address: string
  location: string
  type: string
  severity: string
  agentPaired: boolean
  agentState: AgentState
  agentListenUrl: string | null
  agentVersion: string | null
  agentLastReportAt: string | null
}

/** Native select styled to match the shared Input component. */
export function Select({
  id,
  name,
  defaultValue,
  options,
}: {
  id: string
  name: string
  defaultValue?: string
  options: string[]
}) {
  return (
    <select
      id={id}
      name={name}
      defaultValue={defaultValue}
      className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm capitalize shadow-xs outline-none focus-visible:ring-[3px]"
    >
      {options.map((option) => (
        <option key={option} value={option} className="capitalize">
          {option}
        </option>
      ))}
    </select>
  )
}

function Field({
  label,
  name,
  errors,
  children,
}: {
  label: string
  name: string
  errors: Record<string, string>
  children: ReactNode
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      {children}
      {errors[name] && <p className="text-destructive text-sm">{errors[name]}</p>}
    </div>
  )
}

/**
 * The five editable fields for a server, shared by the "add" sheet and the
 * per-server Settings tab. Render inside an Inertia `<Form>`.
 */
export function ServerFormFields({
  server,
  errors,
}: {
  server?: ServerRecord | null
  errors: Record<string, string>
}) {
  return (
    <>
      <Field label="Friendly name" name="name" errors={errors}>
        <Input id="name" name="name" defaultValue={server?.name} placeholder="api-eu-1" />
      </Field>
      <Field label="IP address or FQDN" name="address" errors={errors}>
        <Input
          id="address"
          name="address"
          defaultValue={server?.address}
          placeholder="10.0.1.4 or api.example.com"
        />
      </Field>
      <Field label="Location" name="location" errors={errors}>
        <Input
          id="location"
          name="location"
          defaultValue={server?.location}
          placeholder="Frankfurt, DE"
        />
      </Field>
      <Field label="Type" name="type" errors={errors}>
        <Select
          id="type"
          name="type"
          defaultValue={server?.type ?? 'http'}
          options={SERVER_TYPES}
        />
      </Field>
      <Field label="Monitoring severity" name="severity" errors={errors}>
        <Select
          id="severity"
          name="severity"
          defaultValue={server?.severity ?? 'medium'}
          options={SERVER_SEVERITIES}
        />
      </Field>
    </>
  )
}
