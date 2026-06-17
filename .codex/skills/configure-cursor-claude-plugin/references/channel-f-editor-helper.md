# Channel F: Editor Context-Menu Helper Actions

Use when the official Cursor Claude Code extension works, but the user wants editor-side helper actions such as:

- sending the current selection to a new Claude Code editor chat,
- copying a file/line/column selection reference,
- changing where those helper actions appear in the editor context menu.

Difficulty: 5.5 medium. Manifest edits are simple, but Cursor menu contribution caching and real UI placement need verification.

This channel is for local helper extensions and menu contributions. It does not configure provider environment variables, model lists, or permission mode.

Run channel `p` before modifying a helper extension `package.json`, extension JavaScript, or Cursor extension registry entry.

## Preferred Pattern

Prefer a small local helper extension over patching the official `anthropic.claude-code` extension manifest. The helper extension may contribute `editor/context` commands that call official Claude Code commands such as `claude-vscode.editor.open`.

Keep the helper narrowly scoped:

- command registration and formatting logic live in the helper extension,
- menu placement lives in the helper extension `package.json`,
- official provider/model/permission behavior stays in channels `b`, `c`, and `e`.

When a helper opens Claude in a side editor group by calling `claude-vscode.editor.open` with `ViewColumn.Beside`, account for the official extension's group-lock side effect. In current Claude Code extension builds, opening a new Claude editor column can run `workbench.action.lockEditorGroup`; if the helper leaves that group locked, later ordinary file clicks may open in a newly created editor group instead of reusing the focused group. After the Claude panel/tab is opened, run `workbench.action.unlockEditorGroup` when available, or instruct the user to unlock the Claude editor group manually before judging normal file-open behavior.

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

The script updates `contributes.menus["editor/context"]` entries for the selected commands, assigns sequential `@1`, `@2`, etc. ordering inside the requested group, creates a timestamped `package.json` backup before writing, and parses the resulting JSON.

If Cursor's extension registry lost the helper entry, restore registration or reinstall the helper before changing command code.

## Verification

1. Parse the helper extension `package.json`.
2. If helper JavaScript changed, run `node --check <helper-extension>/extension.js`.
3. Fully restart Cursor when menu contributions do not change after `Developer: Reload Window`.
4. Use Computer Use or another UI-level check to open the editor context menu and confirm:
   - the helper commands are visible,
   - they are adjacent,
   - they are top-level entries,
   - they are separated from unrelated built-in groups.
5. After using a side-column Claude helper, click an ordinary project file from Explorer. If Cursor creates a fresh editor group/page, check whether the Claude group is locked and whether the helper unlock step ran.

## Common Conclusions

- Helper command missing after reload: the manifest may be cached; fully quit and reopen Cursor.
- Helper commands visible but split apart: they are in different groups or competing with built-in groups.
- Helper command works in Command Palette but not context menu: inspect `when` clauses and current editor focus.
- Opening a new Claude chat works but current-chat insertion does not: official `insertAtMention` may only expose a limited line-level event path; prefer a new-chat helper when exact prompt text must be passed.
- Ordinary files start opening in a fresh editor group after using the helper: the official Claude editor open path probably locked the side editor group; unlock the group and patch the helper to run `workbench.action.unlockEditorGroup` after `claude-vscode.editor.open`.
