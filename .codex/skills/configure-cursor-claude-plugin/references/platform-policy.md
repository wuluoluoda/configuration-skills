# Platform Policy

Use when the host is not confirmed macOS, or when adapting this skill to Windows, Linux, WSL, remote containers, or managed workstations.

The workflow is cross-platform. The concrete paths and shell snippets in this skill are macOS-tested implementation examples.

## macOS

On macOS, the documented paths and shell snippets are executable after channel `p` creates backups and any required consent gates pass.

Examples include:

- Cursor app CLI under `/Applications/Cursor.app/...`.
- Cursor user settings under `~/Library/Application Support/Cursor/User/settings.json`.
- Cursor extension cache under `~/.cursor/extensions`.
- Unix shell tools such as `which`, `find`, `rg`, `cp`, and `chmod`.

## Non-macOS Rule

Do not blindly translate macOS paths or shell syntax. First resolve:

- Cursor user settings path.
- Cursor official Claude Code extension directory.
- Claude Code launcher path.
- The config directory selected by `CLAUDE_CONFIG_DIR`.
- Local helper extension directory and registry entry.
- Platform backup and file-permission semantics.

Then classify the step before acting.

## Keep Executable

These actions may remain executable after platform-native paths are resolved and secrets are redacted:

- `node --check <js-file>`.
- `node scripts/<script>.js --help`.
- JSON parsing or schema checks of a resolved settings path.
- `claude --version`.
- Minimal backend probes such as `claude -p "print ok"` after env and token source are confirmed.
- Read-only file search, using `rg` when available or the platform's equivalent.
- Listing extension directories and reading manifests.

## Use Structured Steps

These should remain structured but not hard-code macOS paths:

- Locate Cursor's User `settings.json`.
- Locate the active `anthropic.claude-code-*` extension directory.
- Read `CLAUDE_CONFIG_DIR` from `claudeCode.environmentVariables`.
- Merge `claudeCode.environmentVariables` by `name`.
- Merge dedicated Claude `settings.json` keys such as `model`, `availableModels`, `fallbackModel`, `permissions`, `sandbox`, and `hooks`.
- Describe rollback as "restore this backup to this resolved path" rather than assuming `cp` or `chmod` semantics.

## Convert To A Proposed Change Plan

These actions must become a natural-language change plan with exact files, keys, backup path, rollback action, and explicit confirmation before execution:

- Writing Cursor user settings.
- Writing the selected Claude config directory.
- Patching the official Claude Code extension webview bundle.
- Editing helper extension manifests or registry entries.
- Deleting, moving, or replacing any config or extension directory.
- Changing file permissions or ACLs.
- Enabling `bypassPermissions`, dangerous prompt skipping, `claudeCode.allowDangerouslySkipPermissions`, or `sandbox.enabled=false`.

For these actions, do not proceed from implied consent. Ask for confirmation after showing the platform-native path and the precise key/value change.

## Channel Notes

- `a`: install and read-only verification can stay executable; platform-specific CLI path discovery must be resolved first.
- `b`: env/config reading and backend probes can stay executable; writes to settings must use a change plan.
- `c`: backend model policy is structured merge work; official webview patching is fragile and must be planned unless already tested on that platform.
- `d`: diagnostics are mostly executable once paths are resolved.
- `e`: all bypass, dangerous prompt, and sandbox writes require explicit consent on every platform.
- `f`: helper manifest reads are executable; helper writes and registry changes need a plan unless platform behavior is already verified.
- `g`: upgrade audits are executable checks plus a written classification report.
- `v`: provider facts are portable; applying them to files follows the platform policy.
