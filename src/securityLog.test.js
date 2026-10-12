jest.mock('@actions/core', () => ({
  __esModule: true,
  info: jest.fn(),
}), { virtual: true });
import * as core from "@actions/core"
import { APPID, sysStartup, sysShutdown, authzFail } from "./securityLog"

/** Parse the single OWASP envelope emitted to core.info during a test. */
const emittedEvent = () => {
  const call = core.info.mock.calls.find(([line]) => typeof line === "string" && line.includes("owasp_event"))
  return JSON.parse(call[0]).owasp_event
}

describe('securityLog OWASP envelope', () => {
  beforeEach(() => jest.clearAllMocks())

  it('emits a sys_startup envelope with the shared schema and a UTC Z timestamp', () => {
    sysStartup("alice", { description: "session opened" })

    const event = emittedEvent()
    expect(event).toMatchObject({
      type: "security",
      appid: APPID,
      event: "sys_startup:alice",
      level: "WARN",
      description: "session opened",
    })
    expect(event.datetime).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/)
  });
  it('encodes the resource in an authz_fail event at CRITICAL', () => {
    authzFail("mallory", "no_registered_key")

    const event = emittedEvent()
    expect(event.event).toBe("authz_fail:mallory,no_registered_key")
    expect(event.level).toBe("CRITICAL")
  });
  it('omits null or undefined metadata fields from the envelope', () => {
    sysShutdown("bob", { description: undefined, note: null })

    const event = emittedEvent()
    expect(event.event).toBe("sys_shutdown:bob")
    expect("description" in event).toBe(false)
    expect("note" in event).toBe(false)
  });
  it('does not let metadata rewrite the reserved OWASP fields', () => {
    sysStartup("carol", { event: "authn_login:attacker", level: "INFO", type: "app", appid: "spoofed" })

    const event = emittedEvent()
    expect(event).toMatchObject({
      event: "sys_startup:carol",
      level: "WARN",
      type: "security",
      appid: APPID,
    })
  });
})
