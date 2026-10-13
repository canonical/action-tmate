# action-tmate Sigma detection rules

Vendor-neutral [Sigma](https://sigmahq.io) rules for the security events emitted
by the [action-tmate](https://github.com/canonical/action-tmate) Action
(`appid: canonical.action-tmate`, `type: security`). Author once here; convert to
the query language of your SIEM with `sigma-cli` / pySigma.

## Field mapping (OWASP -> Sigma selectors)

The Action emits each event as a JSON line **nested under an `owasp_event` key**
(matching the schema used by Canonical's Python `owasp-logger`), so rules select
on dotted `owasp_event.*` field names.

| OWASP field | Sigma selector key | Example |
| --- | --- | --- |
| `event` | `owasp_event.event` | `owasp_event.event\|startswith: 'sys_startup'` |
| `level` | `owasp_event.level` | `owasp_event.level: 'CRITICAL'` |
| `appid` | `owasp_event.appid` / `logsource.product` | `canonical.action-tmate` |

The Action emits severities as `WARN` (`sys_startup`, `sys_shutdown`) and
`CRITICAL` (`authz_fail`). The `event` value is a flat token of the form
`<event_name>:<comma-separated-args>` (for example `sys_startup:<actor>` or
`authz_fail:<actor>,no_registered_key`), so rules match it with `startswith` /
`contains`.

Events are written to the GitHub Actions run log; forwarding that log onward to a
SIEM is the responsibility of the CI/runner platform.

## Validate & apply

```bash
pip install sigma-cli
sigma check docs/security/sigma/action-tmate/
# Convert to Loki (LogQL), for example (install the Loki backend first):
sigma plugin install loki
sigma convert -t loki docs/security/sigma/action-tmate/access_denied_no_key.yml
```

## Rules

| File | Event | Detects |
| --- | --- | --- |
| `debug_session_opened.yml` | `sys_startup` | A debug session opens a live remote-access surface on a CI runner |
| `debug_session_closed.yml` | `sys_shutdown` | A debug session closes (audit, brackets the access window) |
| `access_denied_no_key.yml` | `authz_fail` | A debug session is denied because the actor has no registered SSH key |

## Lifecycle

Rules are version-controlled and updated/validated/merged with the Action release
cycle. Consumers pull validated rules directly from this directory.
