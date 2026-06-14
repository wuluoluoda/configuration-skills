---
name: configure-cursor-claude-plugin
description: Configure Cursor's Claude Code extension to use a local Claude Code install, alternate provider environments, dedicated config directories, permission modes, editor helper actions, and model menu/workflow fixes. Use when installing or repairing Cursor Claude Code integration, routing Cursor to a non-default Claude configuration, changing bypass permission behavior, exposing custom provider models, adjusting local editor context-menu helpers, or diagnosing why the Cursor Claude plugin did not load the intended Claude Code setup.
---

# Configure Cursor Claude Plugin

## Purpose

Configure Cursor's Claude Code extension without assuming the default terminal `claude` environment is the desired one.

Use a channel letter to keep the work precise. Read only the reference for the channel that matches the user's need. Before entering a channel, tell the user the channel difficulty in plain language.

## Channel Router

| Channel | Difficulty | Need | Read |
| --- | --- | --- | --- |
| p | 5.5 medium: protective inventory and backups before edits. | Preflight any change that writes Cursor settings, Claude config, extension cache, helper extension, wrapper, launcher, or provider command state. | `references/channel-p-change-protection.md` |
| a | 5.5 easy: official install/verify path. | Install or verify the Cursor Claude Code extension and local Claude Code launcher. | `references/channel-a-apply-cc-plugin.md` |
| b | 5.5 medium: env/settings merge needs non-bare-config care. | Make Cursor use a different Claude configuration than the normal shell default. | `references/channel-b-dedicated-config.md` |
| c | Hard or fragile: webview patches depend on extension internals. | Make any provider's full model list available in Cursor Claude Code's backend policy or webview menu. | `references/channel-c-models.md` |
| d | 5.5 medium: logs, settings, session files, and UI cache all matter. | Diagnose "it did not work" after a Cursor/Claude configuration change. | `references/channel-d-diagnostics.md` |
| e | Technically easy but high risk: requires an explicit consent gate. | Review or change bypass permission, dangerous skip prompt, and sandbox behavior for Cursor Claude Code. | `references/channel-e-permissions.md` |
| f | 5.5 medium: helper manifests need real UI verification. | Create, repair, or regroup local editor context-menu helper actions that send/copy selections for Claude Code. | `references/channel-f-editor-helper.md` |
| g | 5.5 medium: classify persistent/disposable/schema-sensitive/registry-sensitive surfaces. | Audit upgrade survivability and replay steps for Cursor, Claude Code extension, Claude CLI, provider model lists, or settings schema changes. | `references/channel-g-upgrade-recovery.md` |
| v | 5.5 easy if provider facts are known. | Translate a Volcano-loaded Claude Code setup into provider inputs for Cursor Claude Code. | `references/provider-volcano.md` |

If a request spans multiple needs, execute channels in dependency order: `p -> a -> b -> e -> c -> f -> g -> d`. Provider references such as `v` are inputs to a channel, not standalone global procedure. For example, `v` supplies Volcano env vars and model IDs; channel `b` decides how Cursor loads those env vars, channel `e` decides whether the Cursor-loaded Claude config should use bypass permissions, channel `c` decides how any provider's models are exposed, channel `f` decides whether editor-side helper actions are needed around the official extension, and channel `g` records what must be replayed after upgrades.

## Core Workflow

1. Inspect current state before changing anything:
   - Cursor CLI: `/Applications/Cursor.app/Contents/Resources/app/bin/cursor`
   - Installed extensions: `cursor --list-extensions --show-versions`
   - Local Claude binary: `which claude`, `claude --version`
   - Cursor user settings: `~/Library/Application Support/Cursor/User/settings.json`
2. Decide the channel(s), state their difficulty, and read the matching reference file(s).
3. Run channel `p` before writing files or extension state. Assume the user has a non-bare configuration and preserve unrelated keys.
4. Prefer Cursor extension settings over modifying the user's normal shell profile.
5. When a separate provider is needed, prefer a dedicated `CLAUDE_CONFIG_DIR` over overwriting `~/.claude/settings.json`.
6. Treat permission mode as a separate decision from provider/config loading. Do not enable `bypassPermissions`, dangerous skip prompts, or disabled sandbox merely because channel `b` created a dedicated config.
7. Verify by simulating Cursor's environment with the configured env vars and the selected model.
8. Tell the user which surfaces the change affects:
   - backend Claude execution,
   - permission behavior,
   - editor context-menu helper actions,
   - Cursor webview model menu.

## Safety Rules

- Never print auth tokens, API keys, OAuth tokens, or GitHub tokens. Redact with `[REDACTED]`.
- Never replace an entire settings file or manifest just to add one Cursor Claude setting. Inventory, back up, then merge.
- Do not claim a change is reversible unless a timestamped backup, manifest source, or scripted inverse/replay path exists.
- Do not edit extension cache files unless channel `c` concludes the official UI cannot expose the required models any other way.
- If patching extension files, create a backup beside the patched file and state that a Cursor/extension update may overwrite the patch.
- Do not enable `bypassPermissions`, dangerous skip prompts, `claudeCode.allowDangerouslySkipPermissions`, or `sandbox.enabled=false` without explicit user consent after explaining the effect.
- After changing Cursor settings or webview bundles, tell the user to close old Claude Code panels and run `Developer: Reload Window` or restart Cursor.
- If the project AGENTS.md requires `codex-audit-log`, audit configuration and skill changes before the final response.

## Verification Checklist

Use the minimum checks that match the channel:

- `node --check <patched-js>` for edited JS bundles.
- Parse JSON settings with `node -e`.
- Simulate Cursor launch by constructing env from `claudeCode.environmentVariables`.
- Check Claude transcript/session files only for non-secret evidence such as `entrypoint`, `model`, `CLAUDE_CONFIG_DIR`, or `version`.
- Confirm whether the model menu display has changed after a fresh Cursor reload; static config checks alone do not prove webview UI behavior.
