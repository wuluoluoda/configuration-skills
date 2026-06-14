# Channel P: Change Protection Preflight

Difficulty: 5.5 medium. The edits are usually simple, but the risk is accidentally overwriting a non-bare local configuration.

Use before any channel writes Cursor settings, Claude config, extension cache files, helper extension manifests, wrappers, launchers, or provider command state.

## Inventory First

Assume the user already has meaningful configuration. Before changing anything, inventory the surfaces that may be read or written:

1. Cursor user settings:
   - `claudeCode.claudeProcessWrapper`
   - `claudeCode.environmentVariables`
   - permission-related Cursor settings
2. The Claude config directory selected by `CLAUDE_CONFIG_DIR`.
3. The default Claude config directory used by normal shell `claude`.
4. The official Claude Code extension directory and webview bundle.
5. Any local helper extension directory and Cursor extension registry entry.
6. Wrapper, launcher, shell function, or provider command that supplies env vars or model facts.

Print only non-secret values. Redact tokens and API keys.

## Backup Before Write

Before editing JSON, JavaScript, or a manifest, create a timestamped backup beside the file or record an equivalent reversible source:

- JSON settings: back up the exact file before merge.
- Extension webview or bundle JS: back up the exact file before patching.
- Helper extension `package.json`: back up before changing command, menu, or keybinding contributions.
- Wrapper or launcher scripts: back up before changing command logic.

Do not tell the user a change is rollback-safe unless one of these is true:

- a timestamped backup exists,
- the file is generated from a manifest that is kept outside the disposable cache,
- a scripted inverse or replay path has been verified.

## Merge Rules

Never replace an entire settings file just to add Cursor Claude behavior.

- Preserve unrelated keys.
- Preserve comments only if the parser/editor path supports them; otherwise warn before converting JSONC-like files to strict JSON.
- For `claudeCode.environmentVariables`, merge by `name`.
- If an existing env or setting key has the same name but a different value, report the conflict before changing it.
- Do not replace conflicting values unless the user explicitly asked for that replacement.
- Do not copy entire permission, sandbox, hook, MCP, credential, or session blocks from the user's main Claude config into a dedicated Cursor config.

## Upgrade Recovery Requirement

For every disposable, schema-sensitive, or registry-sensitive change, write down the recovery path before finishing:

- Disposable extension cache patch: name the replay script or backup path.
- Schema-sensitive Claude config: name the keys to revalidate after Claude CLI upgrades.
- Registry-sensitive helper extension: name the manifest and registry entry to recheck.

If no replay or rollback path exists, call that out as a gap instead of implying the change is protected.
