# Channel G: Upgrade Recovery And Replay

Use this channel when auditing whether a Cursor Claude Code setup can survive upgrades, or when preparing repeatable recovery steps after Cursor, the Claude Code extension, the Claude CLI, provider model lists, or settings schema changes.

Difficulty: 5.5 medium. The work is mostly classification and replay verification, but every disposable, schema-sensitive, or registry-sensitive surface needs its own recovery path.

Keep this channel provider-neutral. Provider-specific URLs, env names beyond the Claude/Cursor contract, model IDs, and token handling belong in the matching provider reference.

## Upgrade Surfaces

Treat each surface separately:

1. Cursor user settings
   - Usually persist across Cursor app updates.
   - May be changed by Settings Sync, manual edits, profile resets, or schema changes.
   - Recheck `claudeCode.claudeProcessWrapper`, `claudeCode.environmentVariables`, `CLAUDE_CONFIG_DIR`, duplicate env names, and permission-mode settings.
   - Never print secret values during review.
2. Dedicated `CLAUDE_CONFIG_DIR`
   - Usually persists because it lives outside the Cursor extension cache.
   - Claude CLI upgrades may reinterpret keys such as `model`, `availableModels`, `fallbackModel`, `permissions`, `sandbox`, or `hooks`.
   - Compare it with the user's main Claude config only for risk assessment; do not blindly copy high-risk keys from the main config.
3. Official Claude Code extension cache
   - Extension updates can install a new versioned directory under Cursor's extension store.
   - Any direct webview or bundle patch inside that directory is disposable.
   - Backups beside an old bundle help rollback that old version only; they do not protect a newly installed extension version.
4. Local helper extension
   - A helper extension under Cursor's extension store may survive Cursor app upgrades, but can disappear if the extension registry is regenerated or the directory is removed.
   - Keep helper behavior scriptable and verify both `package.json` contribution points and `extensions.json` registration after upgrades.
5. Claude CLI launcher
   - Wrapper paths can remain valid while the target CLI version changes.
   - Recheck `which claude`, `claude --version`, wrapper target, and a non-secret backend probe with the configured environment.
6. Provider model menu and backend policy
   - Provider model lists can change independently from Cursor and Claude.
   - Update the provider model reference first, then replay backend policy changes and any webview model-menu patch.

## Replay Checklist

After any relevant upgrade:

1. Parse Cursor user settings and print only redacted env values.
2. Confirm `claudeCode.claudeProcessWrapper` resolves to the intended local launcher.
3. Confirm `claudeCode.environmentVariables` contains one `CLAUDE_CONFIG_DIR` and no duplicate env names.
4. Parse the dedicated `settings.json` under `CLAUDE_CONFIG_DIR`.
5. Check `model`, `availableModels`, `fallbackModel`, `permissions`, `sandbox`, and `hooks` against the intended policy.
6. Simulate Cursor's backend environment and run a minimal Claude prompt with a non-secret model.
7. List installed Cursor extensions and locate the active official Claude Code extension directory.
8. If the model menu patch is missing, rerun the model-menu patch script with the provider model reference.
9. If helper editor actions are missing or grouped incorrectly, rerun the helper-menu patch script and fully reload Cursor.
10. Close old Claude Code panels, run `Developer: Reload Window`, and verify the UI from a fresh panel.

Do not mark recovery complete until every changed disposable, schema-sensitive, or registry-sensitive surface has either a verified replay command, a backup path, or an explicit documented gap.

## No-Effect Checklist

Use this checklist when a previous run claimed success but the user reports no visible effect:

1. Treat official Claude Code webview edits as disposable until proven otherwise.
   - Re-locate the active official extension directory instead of assuming the old patched directory is still loaded.
   - If the active directory lacks the expected patch marker or model IDs, rerun the model-menu replay script against that active directory.
2. Treat dedicated Claude settings as schema-sensitive after a CLI upgrade.
   - The file may still contain `availableModels`, `fallbackModel`, `permissions`, `sandbox`, and `hooks`, while the new CLI ignores or reinterprets one of them.
   - Verify by behavior: run a redacted backend probe with Cursor's env and inspect non-secret session metadata, not just JSON presence.
3. Treat helper extensions as registry-sensitive.
   - Check the helper directory, helper `package.json`, and Cursor's `extensions.json` registration as three separate facts.
   - If the directory exists but registration is missing, restore registration or reinstall the helper before changing helper command logic.

## Scripted Recovery

Use existing scripts instead of manual bundle edits:

- Model menu replay: `scripts/patch-cursor-claude-model-menu.js`
- Helper menu regroup replay: `scripts/patch-cursor-claude-helper-menu.js`

If a local helper extension is completely missing, reinstall or recreate the helper extension before running the regroup script. The regroup script assumes an existing helper extension manifest.

## Audit Notes

When documenting upgrade risk, explicitly classify each changed surface:

- Persistent: expected to survive an ordinary upgrade.
- Disposable: expected to be overwritten by extension cache replacement.
- Schema-sensitive: file remains present, but newer software may reinterpret keys.
- Registry-sensitive: file remains present only if Cursor's extension registry still points at it.

Include a short recovery command list in the final user-facing answer whenever any disposable or registry-sensitive surface is involved.
