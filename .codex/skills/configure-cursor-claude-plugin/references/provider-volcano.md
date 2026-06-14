# Provider Reference: Volcano / Ark Coding Plan

Use with channel `b` or `c` when the intended Claude Code provider is Volcano Ark Coding Plan.

Difficulty: 5.5 easy when the provider facts are already known. Keep provider-specific values here and let channels `b`, `c`, and `e` own generic Cursor behavior.

This reference is specifically for migrating a Claude Code setup that is normally loaded by a `volcano` command, shell function, wrapper, or profile into Cursor's Claude Code extension settings. Treat the `volcano` launcher as evidence: inspect what provider env vars, config directory, default model, and model IDs it produces, then pass those provider-specific facts into the generic Cursor channels.

Do not put generic Cursor model-menu logic here. Channel `c` owns model loading and model-menu exposure for every provider; this file only names the Volcano values that channel `b` or `c` may need.

## Environment Variables

Do not print token values.

```json
[
  {"name": "ANTHROPIC_AUTH_TOKEN", "value": "<redacted token>"},
  {"name": "ANTHROPIC_BASE_URL", "value": "https://ark.cn-beijing.volces.com/api/coding"},
  {"name": "ANTHROPIC_MODEL", "value": "doubao-seed-2.0-code"},
  {"name": "ANTHROPIC_DEFAULT_HAIKU_MODEL", "value": "doubao-seed-2.0-lite"},
  {"name": "ANTHROPIC_DEFAULT_SONNET_MODEL", "value": "doubao-seed-2.0-code"},
  {"name": "ANTHROPIC_DEFAULT_OPUS_MODEL", "value": "doubao-seed-2.0-pro"},
  {"name": "CLAUDE_CODE_SUBAGENT_MODEL", "value": "doubao-seed-2.0-lite"},
  {"name": "API_TIMEOUT_MS", "value": "600000"},
  {"name": "CLAUDE_CODE_EFFORT_LEVEL", "value": "max"}
]
```

## Model List

The reusable model list for channel `c` lives in `volcano-models.json`.

```bash
node scripts/patch-cursor-claude-model-menu.js \
  --models references/volcano-models.json \
  --provider-name "Volcano Coding Plan"
```

## Validation Pattern

After applying channel `b`, test at least one non-default model:

```bash
CLAUDE_CONFIG_DIR="<dedicated-config-dir>" \
ANTHROPIC_BASE_URL="https://ark.cn-beijing.volces.com/api/coding" \
ANTHROPIC_AUTH_TOKEN="<token from local config>" \
claude --model kimi-k2.6 -p "print ok"
```

The response should prove the backend provider can serve the model. Do not confuse this with the Cursor webview menu; use channel `c` for menu display.
