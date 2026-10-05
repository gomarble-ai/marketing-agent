#!/usr/bin/env node
/**
 * Build the ZIP to upload to the OpenAI plugin directory (platform.openai.com/plugins → With MCP).
 *
 *   npm run pack:openai
 *
 * Packs the committed tree (git archive HEAD), so commit first. The ZIP holds only what OpenAI reads:
 * .codex-plugin/plugin.json, .mcp.json, skills/, assets/ and LICENSE. .claude-plugin/ is left out so
 * the portal uses the Codex manifest rather than converting the Claude one.
 */

import { execFileSync } from 'child_process';
import { mkdirSync, readFileSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const INCLUDE = ['.codex-plugin', '.mcp.json', 'skills', 'assets', 'LICENSE'];

const { name, version } = JSON.parse(readFileSync(join(ROOT, '.codex-plugin', 'plugin.json'), 'utf-8'));
const dirty = execFileSync('git', ['status', '--porcelain', '--', ...INCLUDE], { cwd: ROOT, encoding: 'utf-8' }).trim();
if (dirty) {
  console.error(`Uncommitted changes in packaged paths; commit them first:\n${dirty}`);
  process.exit(1);
}

mkdirSync(join(ROOT, 'dist'), { recursive: true });
const out = join('dist', `${name}-openai-${version}.zip`);
execFileSync('git', ['archive', '--format=zip', '-o', out, 'HEAD', '--', ...INCLUDE], { cwd: ROOT });
console.log(`Wrote ${out}`);
