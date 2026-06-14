# Channel B: Dedicated Cursor Claude Configuration

Use when Cursor should load a different Claude Code configuration than normal terminal `claude`.

Difficulty: 5.5 medium. The main risk is merging env/settings into a non-bare user configuration without overwriting unrelated keys.

Before writing Cursor user settings or a dedicated Claude config, run channel `p`.

## Preferred Pattern

Create a dedicated config directory and make Cursor pass it through `claudeCode.environmentVariables`:

```json
{
  "claudeCode.claudeProcessWrapper": "/absolute/path/to/claude",
  "claudeCode.environmentVariables": [
    {"name": "CLAUDE_CONFIG_DIR", "value": "/absolute/path/to/.claude-cursor-provider"},
    {"name": "ANTHROPIC_BASE_URL", "value": "https://provider.example/anthropic"},
    {"name": "ANTHROPIC_MODEL", "value": "provider-default-model"}
  ]
}
```

Put a `settings.json` in the dedicated config directory. Copy only stable user preferences from `~/.claude/settings.json`; avoid blindly copying stale sessions, caches, or credentials.

## Merge Discipline

When updating `claudeCode.environmentVariables`, merge entries by `name` and preserve unrelated env vars. If an existing name has a different value, report the conflict before replacing it unless the user already explicitly asked for that exact replacement.

When writing the dedicated `settings.json`, start from the intended minimal keys for Cursor Claude Code. Do not copy permission, sandbox, hook, MCP, credential, or session blocks from the default Claude config unless the user explicitly asked for those behaviors and the relevant channel has been applied.

## Why Not Just Use A Wrapper?

The Cursor extension launches Claude through the SDK query function and reads settings from Claude Code's config directory. A wrapper can work for process env, but `--settings` may not affect every UI state path. `CLAUDE_CONFIG_DIR` is more reliable for keeping Cursor's backend and settings watcher aligned.

## Verification

1. Parse Cursor settings JSON.
2. Simulate the extension environment:
   ```bash
   node - <<'NODE'
   const fs = require('fs'), cp = require('child_process');
   const s = JSON.parse(fs.readFileSync(`${process.env.HOME}/Library/Application Support/Cursor/User/settings.json`, 'utf8'));
   const env = {...process.env};
   for (const {name, value} of s['claudeCode.environmentVariables'] || []) env[name] = value;
   const out = cp.spawnSync(s['claudeCode.claudeProcessWrapper'], ['--model', env.ANTHROPIC_MODEL, '-p', 'print ok'], {env, encoding: 'utf8', timeout: 30000});
   console.log(out.status, (out.stdout + out.stderr).replace(/sk-[A-Za-z0-9_-]+/g, '[REDACTED]'));
   NODE
   ```
3. Inspect extension logs for `Watching for changes in setting files <dedicated>/settings.json`.

## Scope Boundary

This channel makes the backend load the intended configuration. It does not guarantee custom models appear in the Cursor webview model menu; use channel `c` for that.
