// @ts-check
import * as core from "@actions/core"

/**
 * OWASP security event logging for the tmate debug Action.
 *
 * Mirrors the JSON envelope emitted by Canonical's Python `owasp-logger`
 * (used by the garm and tmate-ssh-server charms) so security events share one
 * schema across the fleet: a single object nested under `owasp_event`, with a
 * UTC (RFC3339 "Z") timestamp, `type: "security"`, a stable `appid`, the OWASP
 * `event` identifier, and a `level`.
 *
 * Events are written to the GitHub Actions run log via `@actions/core` at info
 * level; the OWASP severity is carried in the envelope's `level` field rather
 * than mapped onto GitHub annotations, which keeps every event a uniformly
 * parseable line and avoids annotation noise on each debug session. Forwarding
 * the run log onward to a SIEM is the responsibility of the CI/runner platform.
 */

export const APPID = "canonical.action-tmate"

const OWASP_EVENT_KEY = "owasp_event"

/**
 * Emit an OWASP security event envelope with a UTC-rendered timestamp.
 *
 * @param {string} event OWASP event identifier (e.g. `sys_startup:<actor>`).
 * @param {"INFO"|"WARN"|"CRITICAL"} level OWASP severity carried in the envelope.
 * @param {Record<string, unknown>} [metadata] Extra fields (e.g. `description`).
 */
function logEvent(event, level, metadata = {}) {
  // Spread caller metadata first so the required OWASP fields below always win:
  // metadata is supplementary and must never rewrite the event identity/severity.
  const envelope = {
    ...metadata,
    datetime: new Date().toISOString(),
    type: "security",
    appid: APPID,
    event,
    level,
  }
  for (const key of Object.keys(envelope)) {
    if (envelope[key] === undefined || envelope[key] === null) {
      delete envelope[key]
    }
  }
  core.info(JSON.stringify({ [OWASP_EVENT_KEY]: envelope }))
}

/**
 * Record that a tmate debug session (a remote-access surface) was opened.
 *
 * @param {string} actor The identity that initiated the session.
 * @param {Record<string, unknown>} [metadata]
 */
export function sysStartup(actor, metadata) {
  logEvent(`sys_startup:${actor}`, "WARN", metadata)
}

/**
 * Record that a tmate debug session was closed.
 *
 * @param {string} actor The identity associated with the session.
 * @param {Record<string, unknown>} [metadata]
 */
export function sysShutdown(actor, metadata) {
  logEvent(`sys_shutdown:${actor}`, "WARN", metadata)
}

/**
 * Record a denied attempt to access the debug session.
 *
 * @param {string} actor The identity whose access was denied.
 * @param {string} resource The resource access was denied to.
 * @param {Record<string, unknown>} [metadata]
 */
export function authzFail(actor, resource, metadata) {
  logEvent(`authz_fail:${actor},${resource}`, "CRITICAL", metadata)
}
