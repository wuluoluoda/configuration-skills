# Channel A: Apply Claude Code Plugin In Cursor

Use when Cursor does not have the official Claude Code extension, the wrong CLI is being used, or the user asks to "install Claude Code in Cursor".

## Procedure

1. Resolve the real Cursor IDE CLI:
   ```bash
   /Applications/Cursor.app/Contents/Resources/app/bin/cursor --version
   ```
   Do not rely on a `cursor` shim until it is verified; some machines keep a separate Cursor Agent shim ahead of the IDE CLI.

2. Verify local Claude Code:
   ```bash
   which claude
   claude --version
   ```

3. Install the official extension:
   ```bash
   /Applications/Cursor.app/Contents/Resources/app/bin/cursor --install-extension anthropic.claude-code
   ```

4. Verify:
   ```bash
   /Applications/Cursor.app/Contents/Resources/app/bin/cursor --list-extensions --show-versions | rg -i 'anthropic|claude'
   ```

5. Set Cursor's launcher if needed:
   - File: `~/Library/Application Support/Cursor/User/settings.json`
   - Key: `claudeCode.claudeProcessWrapper`
   - Value: absolute path to the intended `claude` binary.

## Notes

- Installing the extension only proves the webview is present. It does not prove the desired provider env or model list is loaded.
- After installation, reload Cursor.
