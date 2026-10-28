#!/usr/bin/env node
// skill-canary — test an Agent Skill in place before publishing it.
// Injects a copy of a skill directory into a skills directory under a
// canary name, rewrites the SKILL.md frontmatter so the agent lists it as a
// distinct test build, and records a manifest for refresh and clean.
//
// MIT License. See LICENSE.

import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { homedir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const MANIFEST_NAME = '.skill-canary.json';
const DEFAULT_SUFFIX = 'canary';
const DEFAULT_NOTE = 'TEST BUILD';
const NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const toolVersion = (() => {
  try {
    return JSON.parse(readFileSync(fileURLToPath(new URL('../package.json', import.meta.url)), 'utf8')).version;
  } catch {
    return '0.0.0';
  }
})();

function fail(message) {
  console.error(`error: ${message}`);
  process.exit(1);
}

function warn(message) {
  console.error(`warning: ${message}`);
}

function usage() {
  console.log(`skill-canary v${toolVersion} — test an Agent Skill in place before publishing

Usage:
  skill-canary inject <skillDir> [--dir <skillsDir>] [--suffix <name>] [--note <text>]
  skill-canary list [--dir <skillsDir>]
  skill-canary refresh [<name>] [--dir <skillsDir>] [--force]
  skill-canary clean [<name>] [--dir <skillsDir>] [--force]

Commands:
  inject   Copy a skill directory into the skills directory as <name>-<suffix>,
           rewriting the SKILL.md frontmatter so the agent lists it as a
           distinct test build. A ${MANIFEST_NAME} manifest records the source
           for refresh and clean.
  list     Show all skill-canary injections in the skills directory.
  refresh  Re-copy the canary from its recorded source and re-apply the marker.
  clean    Delete a canary injection. Only directories carrying a skill-canary
           manifest are ever deleted.

Options:
  --dir <skillsDir>   Skills directory (default: ~/.agents/skills).
  --suffix <name>     Canary suffix (default: canary). The injection is named
                      <name>-<suffix>, and the directory name matches.
  --note <text>       Marker appended to the description (default: TEST BUILD).
  --name <name>       Select a canary by name (alternative to the positional).
  --force             Overwrite a canary modified after injection.

The frontmatter name and the directory name are kept identical so skill
loaders key on the canary, and the description marker stays short to minimize
perturbing auto-trigger behavior.`);
}

function parseOptions(args) {
  const options = { positional: [], force: false };
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--dir' || arg === '--suffix' || arg === '--note' || arg === '--name') {
      const value = args[++i];
      if (value === undefined) fail(`missing value for ${arg}`);
      options[arg.slice(2)] = value;
    } else if (arg === '--force') {
      options.force = true;
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else {
      options.positional.push(arg);
    }
  }
  return options;
}

function skillsRoot(options) {
  return path.resolve(options.dir || path.join(homedir(), '.agents', 'skills'));
}

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

function hashTree(root) {
  const hashes = {};
  const walk = (dir, prefix) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.name === MANIFEST_NAME) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full, rel);
      else if (entry.isFile()) hashes[rel] = sha256(readFileSync(full));
    }
  };
  walk(root, '');
  return hashes;
}

function treeDiff(current, recorded) {
  const changed = [];
  for (const [rel, hash] of Object.entries(recorded)) {
    if (current[rel] !== hash) changed.push(rel);
  }
  for (const rel of Object.keys(current)) {
    if (!(rel in recorded)) changed.push(`${rel} (added)`);
  }
  return changed;
}

function parseFrontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) fail('SKILL.md must start with a YAML frontmatter block delimited by --- lines.');
  const lines = match[1].split(/\r?\n/);
  let nameIndex = -1;
  let descriptionIndex = -1;
  const parseScalar = (value) => {
    const trimmed = value.trim();
    if (trimmed.length >= 2
      && ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'")))) {
      return { value: trimmed.slice(1, -1), quote: trimmed[0] };
    }
    return { value: trimmed, quote: null };
  };
  for (let i = 0; i < lines.length; i++) {
    if (nameIndex === -1) {
      const m = lines[i].match(/^name:[ \t]*(.*)$/);
      if (m) nameIndex = i;
    }
    if (descriptionIndex === -1) {
      const m = lines[i].match(/^description:[ \t]*(.*)$/);
      if (m) descriptionIndex = i;
    }
  }
  if (nameIndex === -1) fail('SKILL.md frontmatter has no "name" field.');
  if (descriptionIndex === -1) fail('SKILL.md frontmatter has no single-line "description" field.');
  return {
    lines,
    nameIndex,
    descriptionIndex,
    name: parseScalar(lines[nameIndex].replace(/^name:[ \t]*/, '')),
    description: parseScalar(lines[descriptionIndex].replace(/^description:[ \t]*/, '')),
    newline: text.includes('\r\n') ? '\r\n' : '\n',
    rest: text.slice(match[0].length),
  };
}

function formatScalar(value, quote) {
  if (quote) return `${quote}${value}${quote}`;
  if (/[:#]/.test(value) || value !== value.trim() || value === '') return `"${value}"`;
  return value;
}

function rewriteFrontmatter(text, name, description) {
  const fm = parseFrontmatter(text);
  const lines = [...fm.lines];
  lines[fm.nameIndex] = `name: ${formatScalar(name, fm.name.quote)}`;
  lines[fm.descriptionIndex] = `description: ${formatScalar(description, fm.description.quote)}`;
  return `---${fm.newline}${lines.join(fm.newline)}${fm.newline}---${fm.newline}${fm.rest}`;
}

function copyFilter(source) {
  const base = path.basename(source);
  return base !== '.git' && base !== 'node_modules' && base !== '.DS_Store' && base !== MANIFEST_NAME;
}

function injectCopy(sourceDir, targetRoot, options) {
  const skillMdPath = path.join(sourceDir, 'SKILL.md');
  if (!existsSync(skillMdPath)) fail(`${sourceDir} has no SKILL.md.`);
  const text = readFileSync(skillMdPath, 'utf8');
  const fm = parseFrontmatter(text);
  if (!NAME_PATTERN.test(fm.name.value)) {
    fail(`skill name "${fm.name.value}" is not lowercase kebab-case.`);
  }
  const suffix = options.suffix || DEFAULT_SUFFIX;
  if (!NAME_PATTERN.test(suffix)) {
    fail(`suffix "${suffix}" is not lowercase kebab-case.`);
  }
  const noteText = options.note || DEFAULT_NOTE;
  const canaryName = `${fm.name.value}-${suffix}`;
  const targetDir = path.join(targetRoot, canaryName);
  if (existsSync(targetDir)) {
    fail(`${targetDir} already exists; run "skill-canary refresh ${canaryName}" or clean it first.`);
  }
  const conflictsWithProduction = existsSync(path.join(targetRoot, fm.name.value));
  mkdirSync(targetDir, { recursive: true });
  cpSync(sourceDir, targetDir, { recursive: true, filter: copyFilter });
  const markedDescription = `${fm.description.value} (${noteText})`;
  writeFileSync(
    path.join(targetDir, 'SKILL.md'),
    rewriteFrontmatter(text, canaryName, markedDescription),
  );
  const manifest = {
    tool: 'skill-canary',
    toolVersion,
    name: canaryName,
    originalName: fm.name.value,
    suffix,
    note: noteText,
    source: path.resolve(sourceDir),
    injectedAt: new Date().toISOString(),
    files: hashTree(targetDir),
  };
  writeFileSync(path.join(targetDir, MANIFEST_NAME), `${JSON.stringify(manifest, null, 2)}\n`);
  if (!options.quiet) {
    console.log(`Injected ${canaryName}`);
    console.log(`  Directory: ${targetDir}`);
    console.log(`  Source:    ${manifest.source}`);
  }
  if (conflictsWithProduction) {
    warn(`the production skill "${fm.name.value}" is installed in the same directory; the agent may auto-load it instead of the canary — invoke the canary by its full name "${canaryName}" in test prompts.`);
  }
  return manifest;
}

function readManifest(dir) {
  const manifestPath = path.join(dir, MANIFEST_NAME);
  if (!existsSync(manifestPath)) return null;
  try {
    return JSON.parse(readFileSync(manifestPath, 'utf8'));
  } catch {
    fail(`${manifestPath} is not valid JSON; refusing to operate on ${dir}.`);
  }
}

function listCanaries(root) {
  if (!existsSync(root)) return [];
  const result = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const dir = path.join(root, entry.name);
    const manifest = readManifest(dir);
    if (manifest && manifest.tool === 'skill-canary') result.push({ dir, manifest });
  }
  return result;
}

function selectCanary(root, selector) {
  const canaries = listCanaries(root);
  if (canaries.length === 0) fail(`no skill-canary injections found under ${root}.`);
  let candidates = canaries;
  if (selector) {
    candidates = canaries.filter(
      (c) => c.manifest.name === selector || c.manifest.originalName === selector,
    );
  }
  if (candidates.length === 0) {
    fail(`no canary matches "${selector}"; known: ${canaries.map((c) => c.manifest.name).join(', ')}.`);
  }
  if (candidates.length > 1) {
    fail(`multiple canaries match; specify one of: ${candidates.map((c) => c.manifest.name).join(', ')}.`);
  }
  return candidates[0];
}

function requireUnmodified({ dir, manifest }, force) {
  const changed = treeDiff(hashTree(dir), manifest.files || {});
  if (changed.length > 0 && !force) {
    const preview = changed.slice(0, 5).join(', ');
    fail(`canary copy was modified after injection (${changed.length} file(s): ${preview}${changed.length > 5 ? ', …' : ''}); pass --force to overwrite.`);
  }
}

function cmdInject(options) {
  const source = options.positional[0];
  if (!source) {
    fail('usage: skill-canary inject <skillDir> [--dir <skillsDir>] [--suffix <name>] [--note <text>]');
  }
  injectCopy(path.resolve(source), skillsRoot(options), options);
}

function cmdList(options) {
  const root = skillsRoot(options);
  const canaries = listCanaries(root);
  if (canaries.length === 0) {
    console.log(`No skill-canary injections under ${root}.`);
    return;
  }
  for (const { manifest } of canaries) {
    console.log(`${manifest.name}  (from ${manifest.source}, injected ${manifest.injectedAt})`);
  }
}

function cmdRefresh(options) {
  const root = skillsRoot(options);
  const selected = selectCanary(root, options.positional[0] || options.name);
  requireUnmodified(selected, options.force);
  const { manifest } = selected;
  if (!existsSync(manifest.source)) {
    fail(`recorded source ${manifest.source} no longer exists.`);
  }
  rmSync(selected.dir, { recursive: true, force: true });
  const fresh = injectCopy(manifest.source, root, {
    suffix: manifest.suffix,
    note: manifest.note,
    quiet: true,
  });
  console.log(`Refreshed ${fresh.name} from ${fresh.source} at ${fresh.injectedAt}.`);
}

function cmdClean(options) {
  const root = skillsRoot(options);
  const selected = selectCanary(root, options.positional[0] || options.name);
  requireUnmodified(selected, options.force);
  const { dir, manifest } = selected;
  if (path.basename(dir) !== manifest.name) {
    fail(`directory name ${dir} does not match manifest name "${manifest.name}"; refusing to delete.`);
  }
  rmSync(dir, { recursive: true, force: true });
  console.log(`Removed ${manifest.name} (${dir}).`);
}

const command = process.argv[2];
const options = parseOptions(process.argv.slice(3));

switch (command) {
  case 'inject':
    cmdInject(options);
    break;
  case 'list':
    cmdList(options);
    break;
  case 'refresh':
    cmdRefresh(options);
    break;
  case 'clean':
    cmdClean(options);
    break;
  case undefined:
  case 'help':
  case '--help':
  case '-h':
    usage();
    break;
  default:
    fail(`unknown command "${command}". Run "skill-canary help".`);
}
