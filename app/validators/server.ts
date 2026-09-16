import vine from '@vinejs/vine'
import { SERVER_TYPES, SERVER_SEVERITIES } from '#models/server'

/**
 * Shared field rules for creating and updating a server.
 */
const fields = {
  name: vine.string().trim().minLength(1).maxLength(120),
  address: vine.string().trim().minLength(1).maxLength(253),
  location: vine.string().trim().minLength(1).maxLength(120),
  type: vine.enum(SERVER_TYPES),
  severity: vine.enum(SERVER_SEVERITIES),
}

export const createServerValidator = vine.create(fields)

export const updateServerValidator = vine.create(fields)

/**
 * Daemon connection settings, edited from the server Settings tab. An empty
 * string clears the URL (unsets it).
 */
export const daemonSettingsValidator = vine.create(
  vine.object({
    daemonListenUrl: vine
      .string()
      .trim()
      .url({ require_tld: false, protocols: ['http', 'https'] })
      .maxLength(255)
      .nullable(),
  })
)
