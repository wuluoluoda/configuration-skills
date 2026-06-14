# Channel D: Diagnostics For "It Did Not Work"

Use after a configuration change when the user says it did not work.

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

## Common Conclusions

- Backend works but menu lacks models: use channel `c`.
- Menu patched but unchanged: old webview is still loaded; reload Cursor.
- Wrong endpoint: `claudeCode.environmentVariables` missing or old Cursor window inherited stale settings.
- Wrong `claude`: `claudeCode.claudeProcessWrapper` points to a shim or wrapper that the extension does not use as expected.
