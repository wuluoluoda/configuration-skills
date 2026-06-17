#!/usr/bin/env node

const fs = require("fs");
const os = require("os");
const path = require("path");

function usage() {
  console.error(`Usage:
  node scripts/patch-cursor-editor-tab-behavior.js [--settings <settings.json>] [--accumulate-tabs true|false] [--dry-run]

Examples:
  node scripts/patch-cursor-editor-tab-behavior.js
  node scripts/patch-cursor-editor-tab-behavior.js --settings "$HOME/Library/Application Support/Cursor/User/settings.json" --accumulate-tabs true
`);
}

function parseArgs(argv) {
  const options = {
    settingsPath: defaultSettingsPath(),
    accumulateTabs: true,
    dryRun: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--settings") {
      options.settingsPath = argv[++index];
    } else if (arg === "--accumulate-tabs") {
      const value = argv[++index];
      if (value !== "true" && value !== "false") {
        throw new Error("--accumulate-tabs must be true or false");
      }
      options.accumulateTabs = value === "true";
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--help" || arg === "-h") {
      usage();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!options.settingsPath) {
    throw new Error("Could not determine Cursor settings path. Pass --settings <settings.json>.");
  }

  return options;
}

function defaultSettingsPath() {
  if (process.platform === "darwin") {
    return path.join(os.homedir(), "Library/Application Support/Cursor/User/settings.json");
  }
  if (process.platform === "win32" && process.env.APPDATA) {
    return path.join(process.env.APPDATA, "Cursor/User/settings.json");
  }
  if (process.platform === "linux") {
    return path.join(os.homedir(), ".config/Cursor/User/settings.json");
  }
  return "";
}

function readJson(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function stamp() {
  return new Date().toISOString().replace(/[-:]/g, "").replace(/\..+/, "").replace("T", "-");
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const settings = readJson(options.settingsPath);
  const desiredPreview = !options.accumulateTabs;
  const previousPreview = settings["workbench.editor.enablePreview"];

  settings["workbench.editor.enablePreview"] = desiredPreview;

  if (previousPreview === desiredPreview) {
    console.log(`No change needed: workbench.editor.enablePreview is already ${desiredPreview}.`);
    return;
  }

  const formatted = `${JSON.stringify(settings, null, 2)}\n`;
  JSON.parse(formatted);

  if (options.dryRun) {
    console.log(`Would set workbench.editor.enablePreview=${desiredPreview} in ${options.settingsPath}`);
    return;
  }

  fs.mkdirSync(path.dirname(options.settingsPath), { recursive: true });
  if (fs.existsSync(options.settingsPath)) {
    const backupPath = `${options.settingsPath}.bak-editor-tabs-${stamp()}`;
    fs.copyFileSync(options.settingsPath, backupPath);
    console.log(`Backup: ${backupPath}`);
  }
  fs.writeFileSync(options.settingsPath, formatted);
  console.log(`Updated: ${options.settingsPath}`);
  console.log(`workbench.editor.enablePreview=${desiredPreview}`);
}

try {
  main();
} catch (error) {
  console.error(error.message);
  usage();
  process.exit(1);
}
