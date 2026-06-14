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

## Non-macOS Failure Policy

If adaptation fails on Windows, Linux, WSL, a remote container, or an unknown platform, do not keep guessing risky writes. Respond based on the channel difficulty declared in `SKILL.md`.

For 5.5 easy or 5.5 medium channels, offer a copyable prompt that the user can paste into a fresh AI conversation. Include only redacted facts and the next concrete goal.

Use this shape:

```text
I am configuring Cursor's Claude Code extension on a non-macOS host.

Platform:
- OS/distribution:
- Shell:
- Cursor version:
- Claude Code CLI version:

Goal:
- Configure Cursor Claude Code to use:
- Provider/config intent:
- Model/menu/helper/permission behavior needed:

Resolved facts so far:
- Cursor user settings path:
- Cursor Claude Code extension directory:
- Claude launcher path:
- CLAUDE_CONFIG_DIR or intended dedicated config dir:
- Existing relevant settings keys, with secrets redacted:
- Files already backed up:

What failed:
- Channel attempted:
- Command or check attempted:
- Redacted error/output:
- Whether the failure was read-only, settings merge, extension patch, helper registry, or permission/sandbox related:

Safety constraints:
- Do not overwrite whole settings files.
- Preserve unrelated keys and merge env vars by name.
- Do not enable bypassPermissions, dangerous prompt skipping, allowDangerouslySkipPermissions, or sandbox.enabled=false without explicit consent.
- For risky writes, first propose exact files, keys, backup path, and rollback action.

Please resolve the platform-native paths and propose the smallest safe next step. Keep low-risk read/validate commands executable, but turn risky writes into a confirmed change plan.
```

If the user asks for the agent to keep working in the current conversation instead, continue only with read-only checks or explicitly confirmed write plans.

For hard or fragile channels, lower expectations. Explain that the macOS path is the known successful implementation, while the current platform likely needs exploratory adaptation of extension internals, registry behavior, or UI cache behavior. Suggest using the macOS-tested path as a map rather than promising an equivalent direct fix.

Use this shape:

```text
This part is marked hard/fragile even for a strong coding model because it depends on Cursor or Claude Code internals that may differ by platform.

Known successful path:
- macOS-tested surface:
- Script or patch used successfully:
- Verification that proved success on macOS:

Current non-macOS facts:
- OS/distribution:
- Cursor version:
- Claude Code CLI version:
- Resolved extension/settings/helper paths:
- Redacted failure output:

Recommended expectation:
- Treat this as exploratory adaptation, not a guaranteed direct port.
- Start by reproducing the macOS success path conceptually: identify the equivalent active extension bundle, settings surface, registry entry, or UI cache.
- Make only read-only observations first.
- If a write is needed, propose exact files, keys, backup path, rollback action, and verification before editing.

Please help adapt this hard/fragile channel from the macOS-tested success path to this platform, and explicitly call out any gaps where the platform behavior is unknown.
```

## Channel Notes

- `a`: install and read-only verification can stay executable; platform-specific CLI path discovery must be resolved first.
- `b`: env/config reading and backend probes can stay executable; writes to settings must use a change plan.
- `c`: backend model policy is structured merge work; official webview patching is fragile and must be planned unless already tested on that platform.
- `d`: diagnostics are mostly executable once paths are resolved.
- `e`: all bypass, dangerous prompt, and sandbox writes require explicit consent on every platform.
- `f`: helper manifest reads are executable; helper writes and registry changes need a plan unless platform behavior is already verified.
- `g`: upgrade audits are executable checks plus a written classification report.
- `v`: provider facts are portable; applying them to files follows the platform policy.
