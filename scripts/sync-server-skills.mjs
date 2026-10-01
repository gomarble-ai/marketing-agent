#!/usr/bin/env node
/**
 * Sync GoMarble's server-side skills into this plugin.
 *
 * The GoMarble MCP server serves its methodology through the `load_skill` tool from a
 * checked-in catalog (mcp-server-sse: ads-mcp-server/src/lib/langfuse/langfuse.json).
 * This script copies the skills listed in scripts/skill-map.json into skills/, so the
 * plugin ships the same methodology the connector uses, and never drifts from it.
 *
 * What it changes, and nothing else:
 *   1. Adds YAML frontmatter (keeps an existing skill's description; falls back to the map).
 *   2. Rewrites server paths (prompts/skills/...) to plugin skill names or references/ files.
 *   3. Prepends a short "In Claude" note where the server text assumes GoMarble's own app
 *      (approval cards, the user_input tool, in-app-only tools).
 *   4. Removes retired skill folders listed in the map.
 *
 * Usage:
 *   git -C ../mcp-server-sse show origin/main:ads-mcp-server/src/lib/langfuse/langfuse.json > /tmp/langfuse.json
 *   node scripts/sync-server-skills.mjs /tmp/langfuse.json
 *   node scripts/check-coverage.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SKILLS_DIR = join(ROOT, 'skills');

const catalogPath = process.argv[2];
if (!catalogPath) {
  console.error('Usage: node scripts/sync-server-skills.mjs <path/to/langfuse.json>');
  process.exit(1);
}

const map = JSON.parse(readFileSync(join(ROOT, 'scripts', 'skill-map.json'), 'utf-8'));
const catalog = JSON.parse(readFileSync(catalogPath, 'utf-8'));
const byName = new Map(catalog.map((item) => [item.name, item]));

// ─── Where each server path lives in the plugin ──────────────
// path -> { skill, ref } (ref is a file under that skill's references/, or null)
const locations = new Map();
for (const entry of map.skills) {
  locations.set(entry.source, { skill: entry.skill, ref: null });
  for (const [file, source] of Object.entries(entry.references || {})) {
    locations.set(source, { skill: entry.skill, ref: file });
  }
}
// Longest first, so ".../create/ad-group" wins over ".../create/ad".
const knownPaths = [...locations.keys()].sort((a, b) => b.length - a.length);

function describe(target, currentSkill) {
  if (target.ref && target.skill === currentSkill) return { text: `references/${target.ref}`, kind: 'file' };
  if (target.ref) return { text: `${target.skill}`, kind: 'skill', ref: target.ref };
  return { text: target.skill, kind: 'skill' };
}

function rewritePaths(body, currentSkill) {
  const unresolved = new Set();
  let out = body;

  // load_skill({ paths: ["prompts/skills/x"], ... }) and "call `load_skill` with `prompts/skills/x`"
  out = out.replace(/`?load_skill\(\{\s*paths:\s*\[\s*"(prompts\/skills\/[^"]+)"[^\]]*\][^)]*\}\)`?/g, (m, p) => {
    const t = locations.get(p);
    if (!t) { unresolved.add(p); return m; }
    const d = describe(t, currentSkill);
    return d.kind === 'file' ? `read \`${d.text}\`` : `use the \`${d.text}\` skill${d.ref ? ` (\`references/${d.ref}\`)` : ''}`;
  });
  out = out.replace(/call `load_skill` with `(prompts\/skills\/[^`]+)`/g, (m, p) => {
    const t = locations.get(p);
    if (!t) { unresolved.add(p); return m; }
    const d = describe(t, currentSkill);
    return d.kind === 'file' ? `read \`${d.text}\`` : `use the \`${d.text}\` skill${d.ref ? ` (\`references/${d.ref}\`)` : ''}`;
  });

  // Any remaining mention, backticked or bare. Match the longest known path at each occurrence.
  out = out.replace(/`?prompts\/skills\/[A-Za-z0-9_\/ .-]*[A-Za-z0-9_-]`?/g, (m) => {
    const ticked = m.startsWith('`');
    const raw = m.replace(/`/g, '');
    const hit = knownPaths.find((p) => raw === p || raw.startsWith(p + '.') || raw.startsWith(p + ' '));
    if (!hit) { unresolved.add(raw); return m; }
    const rest = raw.slice(hit.length);
    const d = describe(locations.get(hit), currentSkill);
    const label = d.kind === 'file' ? d.text : (d.ref ? `${d.text} → references/${d.ref}` : d.text);
    return (ticked ? `\`${label}\`` : label) + rest;
  });

  // Server text refers to sibling skills by short name (`search-analysis`, `creative-analysis`).
  // Expand them to the plugin skill name within the same platform family.
  const family = SHORT_NAME_FAMILIES.find((f) => currentSkill.startsWith(f.prefix));
  if (family) {
    out = out.replace(/`([a-z]+(?:-[a-z]+)*)`/g, (m, name) =>
      family.names.includes(name) ? `\`${family.prefix}${name}\`` : m);
  }

  return { out, unresolved };
}

const SHORT_NAME_FAMILIES = [
  { prefix: 'google-ads-', names: ['search-analysis', 'search-execution', 'pmax-evaluation', 'pmax-scaling', 'shopping', 'depth-of-analysis', 'guardrails', 'tool-fundamentals', 'keywordplanner'] },
  { prefix: 'meta-', names: ['creative-analysis', 'performance-analysis', 'depth-of-analysis', 'guardrails', 'tool-fundamentals', 'agent-operations', 'custom-event-interpretation'] },
];

// ─── "In Claude" adapter notes ────────────────────────────────
// Each note is added only when its trigger appears in the text it precedes.
const ADAPTERS = [
  {
    test: /approval (UI|card|row|panel)|approval cards?|approve (it|them) in the UI/i,
    note: 'Where this says changes appear as approval cards or rows: in Claude, call the propose tool with `mode: "dryrun"` first. That validates the change without touching the account. Show the user each proposed change (entity, current value, new value), and only after an explicit yes call the same tool with `mode: "live"` and just the approved `operation_ids`.',
  },
  {
    test: /\buser_input\b/,
    note: 'Where this says to call `user_input`: that tool exists only in GoMarble\'s own app. Ask the user the same question in chat instead. Where it says not to call `user_input`, don\'t ask — decide from the data.',
  },
  {
    test: /\bgoogle_ads_update_entity\b/,
    note: 'Where this names `google_ads_update_entity`: use the matching propose tool instead — `google_ads_propose_update_campaigns`, `google_ads_propose_update_adgroups`, `google_ads_propose_update_ads`, `google_ads_propose_update_asset`, `google_ads_propose_update_bid_modifiers`, `google_ads_propose_update_negative_keyword_list` or `google_ads_propose_update_pmax_asset_group`.',
  },
  {
    test: /\b(submit_recommendations|record_audit_findings)\b/,
    note: 'Where this names `submit_recommendations` or `record_audit_findings`: those exist only in GoMarble\'s own app. Present the findings and recommendations in your reply instead.',
  },
  {
    test: /\bretrieve_full_tool_output\b/,
    note: 'Where this names `retrieve_full_tool_output`: it isn\'t available in Claude. If an earlier tool result is no longer in context, call the original tool again.',
  },
];

function adapterBlock(text, tools) {
  const notes = ADAPTERS.filter((a) => a.test.test(text)).map((a) => `- ${a.note}`);
  if (tools && tools.length) {
    notes.push(`- GoMarble connector tools for this skill: ${tools.map((t) => `\`${t}\``).join(', ')}.`);
  }
  if (!notes.length) return '';
  return ['> **In Claude.** This methodology is GoMarble\'s own, kept in sync with the GoMarble connector.', ...notes.map((n) => `> ${n}`), '', ''].join('\n');
}

// ─── Frontmatter ──────────────────────────────────────────────
function stripFrontmatter(text) {
  const m = text.match(/^---\n[\s\S]*?\n---\n?/);
  return m ? text.slice(m[0].length) : text;
}

function existingDescription(skill) {
  const file = join(SKILLS_DIR, skill, 'SKILL.md');
  if (!existsSync(file)) return null;
  const m = readFileSync(file, 'utf-8').match(/^---\n([\s\S]*?)\n---/);
  if (!m) return null;
  const line = m[1].match(/^description:\s*(.*)$/m);
  if (!line) return null;
  const value = line[1].trim();
  if (value === '|' || value === '>') {
    // Block scalar: the description is the indented lines that follow.
    const after = m[1].slice(m[1].indexOf(line[0]) + line[0].length).split('\n').slice(1);
    const block = [];
    for (const l of after) {
      if (l.trim() && !/^\s/.test(l)) break;
      block.push(l.trim());
    }
    return block.join(' ').replace(/\s+/g, ' ').trim();
  }
  return value.replace(/^["']|["']$/g, '');
}

function frontmatter(skill, description, source) {
  const esc = description.replace(/"/g, '\\"');
  return `---\nname: ${skill}\ndescription: "${esc}"\nmetadata:\n  source: "${source}"\n---\n\n`;
}

// ─── Run ──────────────────────────────────────────────────────
function server(path) {
  const item = byName.get(path);
  if (!item) throw new Error(`Server skill not found in catalog: ${path}`);
  return stripFrontmatter(item.prompt).trim() + '\n';
}

const report = { written: [], unresolved: [] };

for (const entry of map.skills) {
  const dir = join(SKILLS_DIR, entry.skill);
  const description = existingDescription(entry.skill) || entry.description;
  if (!description) throw new Error(`No description for ${entry.skill}`);

  const { out: body, unresolved } = rewritePaths(server(entry.source), entry.skill);
  unresolved.forEach((p) => report.unresolved.push(`${entry.skill}: ${p}`));

  if (existsSync(join(dir, 'references'))) rmSync(join(dir, 'references'), { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'SKILL.md'), frontmatter(entry.skill, description, entry.source) + adapterBlock(body, entry.tools) + body);
  report.written.push(`skills/${entry.skill}/SKILL.md`);

  for (const [file, source] of Object.entries(entry.references || {})) {
    const { out: refBody, unresolved: refUnresolved } = rewritePaths(server(source), entry.skill);
    refUnresolved.forEach((p) => report.unresolved.push(`${entry.skill}/references/${file}: ${p}`));
    mkdirSync(join(dir, 'references'), { recursive: true });
    writeFileSync(join(dir, 'references', file), `<!-- Synced from GoMarble server skill: ${source} -->\n\n` + adapterBlock(refBody) + refBody);
    report.written.push(`skills/${entry.skill}/references/${file}`);
  }
}

for (const skill of map.retired || []) {
  const dir = join(SKILLS_DIR, skill);
  if (existsSync(dir)) {
    rmSync(dir, { recursive: true, force: true });
    console.log(`retired  skills/${skill}`);
  }
}

report.written.forEach((f) => console.log(`synced   ${f}`));
if (report.unresolved.length) {
  console.log('\nServer paths with no plugin home (left as-is; the connector\'s load_skill can still load them):');
  report.unresolved.forEach((u) => console.log(`  ${u}`));
}
