# Channel C: Provider Models And Cursor Model Menu

Use when provider models work from Claude Code but Cursor's Claude Code model selector does not show them.

Difficulty: hard or fragile. Backend model policy is normal settings work, but patching the official webview depends on extension internals and may be overwritten by extension upgrades.

Before writing backend settings or webview bundles, run channel `p`. If a webview patch is used, finish with channel `g` so the replay path is explicit.

## Key Distinction

Claude Code settings such as `model`, `availableModels`, and `enforceAvailableModels` can affect backend selection and policy. The Cursor webview model menu may still render only `claudeConfig.models` returned by Claude Code initialization.

Therefore, verify two separate surfaces:

- Backend: can `claude --model <provider-model> -p ...` return successfully under Cursor env?
- UI: does the webview menu show the model after reload?

## Backend Setup

In the dedicated config directory's `settings.json`, include:

```json
{
  "model": "provider-default-model",
  "availableModels": ["provider-default-model", "provider-other-model"],
  "enforceAvailableModels": true,
  "fallbackModel": ["provider-default-model"]
}
```

Merge these keys into the dedicated config instead of replacing the whole file. Preserve unrelated keys and report conflicts before replacing existing model policy values.

## UI Menu Patch Last Resort

Only patch the extension webview when official settings do not expose the custom provider models.

Prefer the reusable patch script shipped with this skill. It makes extension upgrades recoverable because the same provider model file can be applied to the newly installed extension directory.

```bash
node scripts/patch-cursor-claude-model-menu.js \
  --models references/<provider-models>.json \
  --provider-name "<Provider Name>"
```

The script locates the newest `anthropic.claude-code-*` extension under `~/.cursor/extensions`, creates a timestamped backup beside `webview/index.js`, patches the model menu, runs `node --check`, and verifies that every requested model ID is present in the bundle.

Use `--extension-dir <dir>` when multiple extension installs exist and the newest one is not the target.

Manual fallback:

1. Locate the extension:
   ```bash
   find ~/.cursor/extensions -maxdepth 1 -type d -iname '*claude-code*'
   ```
2. Back up `webview/index.js` beside the original.
3. Add a tiny helper that appends provider models to the model array passed to the model menu.
4. Patch the model menu prop from:
   ```js
   availableModels: t.claudeConfig.value?.models
   ```
   to:
   ```js
   availableModels: <helper>(t.claudeConfig.value?.models)
   ```
5. Also ensure display-name resolution uses the augmented list if the current model indicator is wrong.

## Verification

Run:

```bash
node scripts/patch-cursor-claude-model-menu.js --models references/<provider-models>.json --provider-name "<Provider Name>"
rg 'provider-model-id|helper-name' ~/.cursor/extensions/<extension>/webview/index.js
```

Then close existing Claude Code panels and reload Cursor. Old webviews keep the old JS in memory.

## Caveat

Patching `~/.cursor/extensions/...` is local. Cursor or extension updates may overwrite it, so treat the script as the source of truth and rerun it after every `anthropic.claude-code` extension update. Keep the generated backup path for rollback.
