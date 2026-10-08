#!/usr/bin/env node
/**
 * Check that the plugin's skills cover the GoMarble connector.
 *
 *   node scripts/check-coverage.mjs
 *
 * Fails (exit 1) when:
 *   - a connector tool in scripts/connector-tools.json isn't named in any skill or command, or
 *   - a skill or command names a GoMarble-looking tool the connector doesn't expose.
 * Prints which skills cover each tool family.
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { dirname, join, relative, resolve } from 'path';
import { fileURLToPath } from 'url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const { tools } = JSON.parse(readFileSync(join(ROOT, 'scripts', 'connector-tools.json'), 'utf-8'));
const toolSet = new Set(tools);

// Tool names that may appear in skills even though the connector doesn't expose them.
// Keep this to explicit "never call X" warnings. Anything that tells the model to CALL a
// missing tool must be rewritten instead (scripts/skill-rewrites.json for synced skills),
// or the model makes failed calls.
const ALLOWED_UNEXPOSED = new Set([
  'facebook_execute_approved_operation', // meta-agent-operations: "no longer exists; never call it"
  // meta-create-master-skill / google-ads-create-master-skill: "the legacy tools … no longer exist"
  'facebook_propose_create_campaign',
  'facebook_propose_create_adset',
  'facebook_propose_create_ad_with_creative',
  'google_ads_propose_create_campaign',
]);

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith('.md') ? [p] : [];
  });
}

const files = walk(join(ROOT, 'skills'));
const coveredBy = new Map(tools.map((t) => [t, new Set()]));
const unknown = new Map();
const PREFIX = /^(ads_library|bing_ads|facebook|gdrive|google_ads|google_analytics|google_drive|gsc|impact|instagram|klaviyo|linkedin|shopify|snowflake|tiktok)[-_]/;

for (const file of files) {
  const text = readFileSync(file, 'utf-8');
  const owner = relative(ROOT, file).split('/').slice(0, 2).join('/');
  for (const m of text.matchAll(/`([a-z][a-z0-9]*(?:[_-][a-z0-9]+)+)`/g)) {
    const name = m[1];
    if (toolSet.has(name)) coveredBy.get(name).add(owner);
    else if (PREFIX.test(name) && !ALLOWED_UNEXPOSED.has(name) && /_(get|list|run|search|propose|fetch|analyze|discover|find|execute|inspect|check|compare|batch|upload|prepare|read|create|copy|download)/.test(name)) {
      if (!unknown.has(name)) unknown.set(name, new Set());
      unknown.get(name).add(owner);
    }
  }
}

const families = {};
for (const t of tools) {
  const fam = t.match(PREFIX)?.[1] || t;
  families[fam] ??= { total: 0, covered: 0 };
  families[fam].total += 1;
  if (coveredBy.get(t).size) families[fam].covered += 1;
}

const missing = tools.filter((t) => !coveredBy.get(t).size);
console.log(`Connector tools covered by a skill: ${tools.length - missing.length}/${tools.length}\n`);
for (const [fam, { total, covered }] of Object.entries(families)) {
  console.log(`  ${covered === total ? '✔' : '✗'} ${fam.padEnd(20)} ${covered}/${total}`);
}
if (missing.length) {
  console.log('\nNot covered by any skill:');
  missing.forEach((t) => console.log(`  ${t}`));
}
if (unknown.size) {
  console.log('\nNamed in skills but not exposed by the connector:');
  for (const [name, owners] of unknown) console.log(`  ${name}  (${[...owners].join(', ')})`);
}
process.exit(missing.length || unknown.size ? 1 : 0);
