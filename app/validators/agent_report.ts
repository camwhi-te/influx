import vine from '@vinejs/vine'

/**
 * Validates the envelope of an ingest report. The `snapshot` and `rollup`
 * bodies are intentionally loose — they are stored verbatim and shaped on read
 * by `#services/agent_protocol`.
 */
export const agentReportValidator = vine.create(
  vine.object({
    schema_version: vine.number(),
    agent_version: vine.string().maxLength(64).optional(),
    report_seq: vine.number().min(0),
    boot_id: vine.string().minLength(1).maxLength(128),
    window: vine.object({
      start: vine.string(),
      end: vine.string(),
      sample_count: vine.number().min(0),
    }),
    rollup: vine.record(vine.any()).optional(),
    snapshot: vine.record(vine.any()),
    events: vine
      .array(
        vine.object({
          at: vine.string().optional(),
          kind: vine.string().optional(),
          detail: vine.string().optional(),
        })
      )
      .optional(),
  })
)
