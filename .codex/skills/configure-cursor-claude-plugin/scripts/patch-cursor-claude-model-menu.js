#!/usr/bin/env node

const fs = require("fs");
const os = require("os");
const path = require("path");
const cp = require("child_process");

const helperName = "__cursorClaudeProviderModels";

function usage() {
  console.error(`Usage:
  node scripts/patch-cursor-claude-model-menu.js --models <models.json> [--extension-dir <dir>] [--provider-name <name>]

models.json may be either:
  ["model-id"]
or:
  [{"value":"model-id","displayName":"Model Name","description":"Provider"}]
`);
  process.exit(2);
}

function parseArgs(argv) {
  const out = { providerName: "Provider" };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--models") out.modelsPath = argv[++i];
    else if (arg === "--extension-dir") out.extensionDir = argv[++i];
    else if (arg === "--provider-name") out.providerName = argv[++i];
    else if (arg === "--help" || arg === "-h") usage();
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!out.modelsPath) usage();
  return out;
}

function latestClaudeExtension() {
  const root = path.join(os.homedir(), ".cursor", "extensions");
  const dirs = fs.readdirSync(root, { withFileTypes: true })
    .filter((d) => d.isDirectory() && /^anthropic\.claude-code-/i.test(d.name))
    .map((d) => path.join(root, d.name))
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
  if (!dirs.length) throw new Error(`No anthropic.claude-code extension found under ${root}`);
  return dirs[0];
}

function titleCaseModel(value) {
  return value
    .split(/[-_.]+/)
    .filter(Boolean)
    .map((part) => part ? part[0].toUpperCase() + part.slice(1) : part)
    .join(" ");
}

function loadModels(modelsPath, providerName) {
  const raw = JSON.parse(fs.readFileSync(modelsPath, "utf8"));
  if (!Array.isArray(raw) || raw.length === 0) {
    throw new Error("models.json must be a non-empty JSON array");
  }
  return raw.map((item) => {
    if (typeof item === "string") {
      return { value: item, displayName: titleCaseModel(item), description: providerName };
    }
    if (item && typeof item === "object" && typeof item.value === "string") {
      return {
        value: item.value,
        displayName: item.displayName || titleCaseModel(item.value),
        description: item.description || providerName,
      };
    }
    throw new Error("Each model must be a string or an object with a string value");
  });
}

function helperSource(models) {
  return `function ${helperName}(e){let t=[...e??[]],i=new Set(t.map(n=>n.value));for(let n of ${JSON.stringify(models)})if(!i.has(n.value))t.push(n);return t}`;
}

function patchSource(source, models) {
  const helper = helperSource(models);
  let patched = source;

  const existingHelper = new RegExp(`function ${helperName}\\(e\\)\\{.*?return t\\}`);
  const legacyCbVHelper = /function CbV\(e\)\{let t=\[\.\.\.e\?\?\[\]\],i=new Set\(t\.map\(n=>n\.value\)\);for\(let n of \[.*?\]\)if\(!i\.has\(n\.value\)\)t\.push\(n\);return t\}/;
  if (existingHelper.test(patched)) {
    patched = patched.replace(existingHelper, helper);
    if (legacyCbVHelper.test(patched) && !patched.includes("availableModels:CbV(")) {
      patched = patched.replace(legacyCbVHelper, "");
    }
  } else if (legacyCbVHelper.test(patched)) {
    patched = patched.replace(legacyCbVHelper, helper);
  } else if (patched.includes("function txe(")) {
    patched = patched.replace("function txe(", `${helper}function txe(`);
  } else {
    throw new Error("Could not find a stable insertion point near function txe(");
  }

  const originalMenuProp = "availableModels:t.claudeConfig.value?.models";
  const patchedMenuProp = `availableModels:${helperName}(t.claudeConfig.value?.models)`;
  const legacyCbVMenuProp = "availableModels:CbV(t.claudeConfig.value?.models)";
  const originalCombinedModels = "function _v(e){return[...e?.models??[],...e?.unavailable_models??[]]}";
  const legacyCbVCombinedModels = "function _v(e){return CbV([...e?.models??[],...e?.unavailable_models??[]])}";
  const patchedCombinedModels = `function _v(e){return ${helperName}([...e?.models??[],...e?.unavailable_models??[]])}`;

  if (patched.includes(originalMenuProp)) {
    patched = patched.replace(originalMenuProp, patchedMenuProp);
  } else if (patched.includes(legacyCbVMenuProp)) {
    patched = patched.replace(legacyCbVMenuProp, patchedMenuProp);
  } else if (!patched.includes(patchedMenuProp)) {
    throw new Error("Could not find Cursor Claude model menu availableModels prop");
  }

  if (patched.includes(originalCombinedModels)) {
    patched = patched.replace(originalCombinedModels, patchedCombinedModels);
  } else if (patched.includes(legacyCbVCombinedModels)) {
    patched = patched.replace(legacyCbVCombinedModels, patchedCombinedModels);
  }

  return patched;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const extensionDir = args.extensionDir || latestClaudeExtension();
  const indexPath = path.join(extensionDir, "webview", "index.js");
  if (!fs.existsSync(indexPath)) throw new Error(`Missing webview bundle: ${indexPath}`);

  const models = loadModels(args.modelsPath, args.providerName);
  const before = fs.readFileSync(indexPath, "utf8");
  const after = patchSource(before, models);

  if (after === before) {
    console.log(`Already patched: ${indexPath}`);
  } else {
    const stamp = new Date().toISOString().replace(/[-:T.Z]/g, "").slice(0, 14);
    const backupPath = `${indexPath}.bak-provider-models-${stamp}`;
    fs.copyFileSync(indexPath, backupPath);
    fs.writeFileSync(indexPath, after);
    console.log(`Patched: ${indexPath}`);
    console.log(`Backup: ${backupPath}`);
  }

  const check = cp.spawnSync(process.execPath, ["--check", indexPath], { encoding: "utf8" });
  if (check.status !== 0) {
    process.stderr.write(check.stdout || "");
    process.stderr.write(check.stderr || "");
    process.exit(check.status || 1);
  }

  const finalSource = fs.readFileSync(indexPath, "utf8");
  const missing = models.map((m) => m.value).filter((value) => !finalSource.includes(value));
  if (missing.length) throw new Error(`Patched bundle is missing model ids: ${missing.join(", ")}`);
  console.log(`Verified ${models.length} provider models in ${indexPath}`);
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
