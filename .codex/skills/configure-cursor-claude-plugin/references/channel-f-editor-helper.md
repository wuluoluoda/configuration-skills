# Channel F: Editor Context-Menu Helper Actions

Use when the official Cursor Claude Code extension works, but the user wants editor-side helper actions such as:

- sending the current selection to a new Claude Code editor chat,
- copying a file/line/column selection reference,
- changing where those helper actions appear in the editor context menu.

This channel is for local helper extensions and menu contributions. It does not configure provider environment variables, model lists, or permission mode.

## Preferred Pattern

Prefer a small local helper extension over patching the official `anthropic.claude-code` extension manifest. The helper extension may contribute `editor/context` commands that call official Claude Code commands such as `claude-vscode.editor.open`.

Keep the helper narrowly scoped:

- command registration and formatting logic live in the helper extension,
- menu placement lives in the helper extension `package.json`,
- official provider/model/permission behavior stays in channels `b`, `c`, and `e`.

## Menu Grouping

Cursor inherits VS Code menu grouping behavior. To show related helper commands as adjacent top-level context-menu items, give their `editor/context` contributions the same custom group and order:

```json
{
  "command": "example.addSelectionToNewClaudeChat",
  "when": "editorTextFocus && !editorReadonly",
  "group": "1_claude_helper@1"
},
{
  "command": "example.copySelectionReference",
  "when": "editorTextFocus",
  "group": "1_claude_helper@2"
}
```

Avoid mixing helper commands into built-in groups such as `navigation` unless the user explicitly wants them interleaved with Go to Definition, Go to References, or refactor actions. If a custom group hides the commands, try a normal numeric prefix such as `1_claude_helper`; verify in the real Cursor context menu because static manifest checks do not prove menu rendering.

## Reusable Patch Script

Use the included script to update an existing helper extension manifest:

```bash
node scripts/patch-cursor-claude-helper-menu.js \
  --extension-dir "<helper-extension-dir>" \
  --group "1_claude_helper" \
  --command "example.addSelectionToNewClaudeChat" \
  --command "example.copySelectionReference"
```

The script updates `contributes.menus["editor/context"]` entries for the selected commands, assigns sequential `@1`, `@2`, etc. ordering inside the requested group, and parses the resulting JSON.

## Verification

1. Parse the helper extension `package.json`.
2. If helper JavaScript changed, run `node --check <helper-extension>/extension.js`.
3. Fully restart Cursor when menu contributions do not change after `Developer: Reload Window`.
4. Use Computer Use or another UI-level check to open the editor context menu and confirm:
   - the helper commands are visible,
   - they are adjacent,
   - they are top-level entries,
   - they are separated from unrelated built-in groups.

## Common Conclusions

- Helper command missing after reload: the manifest may be cached; fully quit and reopen Cursor.
- Helper commands visible but split apart: they are in different groups or competing with built-in groups.
- Helper command works in Command Palette but not context menu: inspect `when` clauses and current editor focus.
- Opening a new Claude chat works but current-chat insertion does not: official `insertAtMention` may only expose a limited line-level event path; prefer a new-chat helper when exact prompt text must be passed.
