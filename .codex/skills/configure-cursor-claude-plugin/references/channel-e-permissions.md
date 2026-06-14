# Channel E: Permission Mode And Sandbox

Use when the user asks to turn on/off bypass permissions, allow dangerous skip prompts, reduce permission prompts, or audit whether Cursor Claude Code is running with broad tool permissions.

Difficulty: technically easy but high risk. This channel changes the safety boundary, not just user-interface prompt frequency.

This channel is intentionally separate from channel `b`. Loading a dedicated provider config does not imply that Cursor should also run with bypass permissions.

## Surfaces To Inspect

Check both Cursor extension settings and the Claude config directory selected by `CLAUDE_CONFIG_DIR`.

Cursor user settings may include:

```json
{
  "claudeCode.allowDangerouslySkipPermissions": true
}
```

The dedicated Claude `settings.json` may include:

```json
{
  "permissions": {
    "defaultMode": "bypassPermissions",
    "skipDangerousModePermissionPrompt": true
  },
  "skipDangerousModePermissionPrompt": true,
  "sandbox": {
    "enabled": false
  }
}
```

## Decision Rules

- Default posture: report the current permission mode before changing it.
- `bypassPermissions` is not ordinary "fewer popups". It lets Claude Code run available tools without the usual tool confirmations.
- `skipDangerousModePermissionPrompt` skips the dangerous-mode reminder.
- `sandbox.enabled=false` further widens the local command, file, or network boundary when the Claude Code version honors sandbox settings.
- Do not treat "make it work", "use another config", "load this provider", or "reduce friction" as consent to broad execution.
- Only enable broad bypass behavior after explaining these effects and receiving explicit user consent for the specific setting(s).
- Prefer narrower allowlists or project-local permissions when the user's goal is only to reduce repeated prompts for known safe tools.
- Do not copy permission blocks from the normal `~/.claude/settings.json` into a Cursor-specific config without calling out the broader execution surface.
- If sandbox is disabled, say that this affects local command/file/network safety boundaries, not just UX prompts.

## Consent Gate

Do not enable any of the following without explicit consent after the warning above:

- `permissions.defaultMode = "bypassPermissions"`
- `skipDangerousModePermissionPrompt = true`
- `permissions.skipDangerousModePermissionPrompt = true`
- `claudeCode.allowDangerouslySkipPermissions = true`
- `claudeCode.initialPermissionMode = "bypassPermissions"`
- `sandbox.enabled = false`

If the user has not consented, stop before writing those keys and offer the safer mode instead.

## Apply

Only after the consent gate passes, enable broad bypass behavior in the selected Cursor Claude config:

```json
{
  "permissions": {
    "defaultMode": "bypassPermissions",
    "skipDangerousModePermissionPrompt": true
  },
  "skipDangerousModePermissionPrompt": true
}
```

To reduce risk while keeping the provider config:

```json
{
  "permissions": {
    "defaultMode": "default"
  },
  "skipDangerousModePermissionPrompt": false,
  "sandbox": {
    "enabled": true
  }
}
```

Adjust sandbox fields carefully; provider endpoints may need explicit network allowance depending on the user's Claude Code version and sandbox implementation.

## Verification

1. Parse the Cursor settings JSON and the selected Claude `settings.json`.
2. Confirm which `CLAUDE_CONFIG_DIR` Cursor is passing.
3. Inspect recent Claude Code logs or transcripts for `permissionMode` or session metadata.
4. Tell the user the resulting mode plainly:
   - prompts enabled or bypassed,
   - dangerous mode prompt skipped or shown,
   - sandbox enabled or disabled.
