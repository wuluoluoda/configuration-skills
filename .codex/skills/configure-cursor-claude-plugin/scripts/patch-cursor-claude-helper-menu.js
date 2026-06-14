#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

function usage(exitCode = 2) {
  console.error(`Usage:
  node scripts/patch-cursor-claude-helper-menu.js --extension-dir <dir> --group <menu-group> --command <command-id> [--command <command-id>...]

Example:
  node scripts/patch-cursor-claude-helper-menu.js \\
    --extension-dir ~/.cursor/extensions/codex.claude-add-to-chat-0.0.1 \\
    --group 1_claude_helper \\
    --command codex.claudeAddToNewChat \\
    --command codex.copySelectionWithLineNumbers
`);
  process.exit(exitCode);
}

function parseArgs(argv) {
  const out = { commands: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--extension-dir") out.extensionDir = argv[++i];
    else if (arg === "--group") out.group = argv[++i];
    else if (arg === "--command") out.commands.push(argv[++i]);
    else if (arg === "--help" || arg === "-h") usage(0);
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!out.extensionDir || !out.group || out.commands.length === 0) usage();
  return out;
}

function expandHome(input) {
  if (input === "~") return process.env.HOME;
  if (input.startsWith("~/")) return path.join(process.env.HOME, input.slice(2));
  return input;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const extensionDir = expandHome(args.extensionDir);
  const packagePath = path.join(extensionDir, "package.json");
  if (!fs.existsSync(packagePath)) {
    throw new Error(`Missing package.json: ${packagePath}`);
  }

  const json = JSON.parse(fs.readFileSync(packagePath, "utf8"));
  const menu = json.contributes?.menus?.["editor/context"];
  if (!Array.isArray(menu)) {
    throw new Error(`No contributes.menus["editor/context"] array in ${packagePath}`);
  }

  const missing = [];
  args.commands.forEach((command, index) => {
    const item = menu.find((entry) => entry.command === command);
    if (!item) {
      missing.push(command);
      return;
    }
    item.group = `${args.group}@${index + 1}`;
  });
  if (missing.length) {
    throw new Error(`Missing editor/context command entries: ${missing.join(", ")}`);
  }

  fs.writeFileSync(packagePath, `${JSON.stringify(json, null, 2)}\n`);
  JSON.parse(fs.readFileSync(packagePath, "utf8"));
  console.log(`Updated ${args.commands.length} editor context menu item(s) in ${packagePath}`);
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
