# Channel D: Diagnostics For "It Did Not Work"

Use after a configuration change when the user says it did not work.

Difficulty: 5.5 medium. Expect to check logs, settings, session files, extension cache, and UI reload state instead of trusting one static file.

## Diagnose In Layers

1. **Extension installed**
   ```bash
   /Applications/Cursor.app/Contents/Resources/app/bin/cursor --list-extensions --show-versions | rg -i 'anthropic|claude'
   ```

2. **Cursor settings loaded**
   Parse `~/Library/Application Support/Cursor/User/settings.json` and print only non-secret values.

3. **Claude process launched by extension**
   Inspect:
   ```bash
   ~/Library/Application Support/Cursor/logs/*/window*/exthost/Anthropic.claude-code/Claude VSCode.log
   ```
   Look for:
   - `Spawning Claude ... <path>`
   - provider endpoint logs
   - `Watching for changes in setting files ...`
   - current model debug lines

4. **Claude config directory**
   Inspect session files under the configured `CLAUDE_CONFIG_DIR`:
   - `sessions/*.json`
   - `projects/**/*.jsonl`
   Look for `entrypoint: "claude-vscode"`, `version`, and assistant `message.model`.

5. **Backend model works**
   Simulate Cursor env from `claudeCode.environmentVariables` and run a short `-p` request with a non-default model.

6. **Webview UI cache**
   If backend works but UI is wrong, close all Claude Code webview tabs and run `Developer: Reload Window`.

## Failure Regression Self-Check

When a skill run completed but the user says it had no effect, first check whether the previously changed surface was replaced, reinterpreted, or deregistered:

1. **Disposable webview patch**
   - Official Claude Code extension upgrades can create a new versioned extension directory.
   - If the model menu or webview behavior reverted, locate the active `anthropic.claude-code-*` directory and confirm the patched marker or expected model IDs still exist in its webview bundle.
   - If missing, use channel `g` to replay the webview/model-menu patch, then reload Cursor.
2. **Schema-sensitive Claude CLI settings**
   - Claude CLI upgrades may keep the same dedicated config file but change how `availableModels`, `fallbackModel`, `permissions`, `sandbox`, or `hooks` are interpreted.
   - If backend behavior changed without an obvious Cursor settings change, re-run a minimal backend probe under Cursor's env and inspect Claude logs/session metadata for the active model and permission mode.
3. **Registry-sensitive helper extension**
   - The helper extension directory may still exist while Cursor's `extensions.json` no longer registers it.
   - If editor context-menu actions disappear or do nothing, verify both the helper `package.json` contribution points and Cursor's extension registry entry before editing command code.

## Common Conclusions

- Backend works but menu lacks models: use channel `c`.
- Menu patched but unchanged: old webview is still loaded; reload Cursor.
- Wrong endpoint: `claudeCode.environmentVariables` missing or old Cursor window inherited stale settings.
- Wrong `claude`: `claudeCode.claudeProcessWrapper` points to a shim or wrapper that the extension does not use as expected.
- Helper commands installed but absent from menus: Cursor registry lost the helper registration or the menu `when`/`group` no longer matches the active editor context; use channel `f`, then channel `g` if an upgrade likely caused it.
