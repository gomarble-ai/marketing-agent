#!/usr/bin/env node
/**
 * Build the ZIP to upload to the OpenAI plugin directory (platform.openai.com/plugins → With MCP).
 *
 *   npm run pack:openai
 *
 * Packs the committed tree (git archive HEAD), so commit first. The ZIP holds only what OpenAI reads:
 * .codex-plugin/plugin.json, .mcp.json, skills/, assets/ and LICENSE. .claude-plugin/ is left out so
 * the portal uses the Codex manifest rather than converting the Claude one.
 *
 * The ZIP's .mcp.json is written in OpenAI's remote-server form ("type": "streamable-http" + url),
 * derived from the repo's .mcp.json. The repo file keeps Claude's form ("type": "http" plus the
 * oauth hint) because Claude Code, the Claude directory and local Codex installs read it; only the
 * copy inside this ZIP changes.
 */

import { execFileSync } from 'child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
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

/** The repo's MCP servers in OpenAI's remote-server form: just the transport type and URL. */
function openAiMcp(repoMcp) {
  const mcpServers = {};
  for (const [key, server] of Object.entries(repoMcp.mcpServers ?? {})) {
    if (!server?.url) throw new Error(`.mcp.json server "${key}" has no url`);
    mcpServers[key] = { type: 'streamable-http', url: server.url };
  }
  return { mcpServers };
}

mkdirSync(join(ROOT, 'dist'), { recursive: true });
const out = join(ROOT, 'dist', `${name}-openai-${version}.zip`);
rmSync(out, { force: true });

const stage = mkdtempSync(join(tmpdir(), 'pack-openai-'));
try {
  const tar = join(stage, 'package.tar');
  execFileSync('git', ['archive', '--format=tar', '-o', tar, 'HEAD', '--', ...INCLUDE], { cwd: ROOT });
  execFileSync('tar', ['-xf', tar, '-C', stage]);
  rmSync(tar);
  const repoMcp = JSON.parse(readFileSync(join(stage, '.mcp.json'), 'utf-8'));
  writeFileSync(join(stage, '.mcp.json'), JSON.stringify(openAiMcp(repoMcp), null, 2) + '\n');
  execFileSync('zip', ['-qrX', out, ...INCLUDE], { cwd: stage });
} finally {
  rmSync(stage, { recursive: true, force: true });
}
console.log(`Wrote ${out.slice(ROOT.length + 1)}`);
