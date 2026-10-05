#!/usr/bin/env node
/**
 * Marketing Agent — install / uninstall CLI (cross-platform: macOS / Linux / Windows)
 *
 * Usage:
 *   npx marketing-agent                  # install to both Claude Code + Codex
 *   npx marketing-agent --claude         # Claude only
 *   npx marketing-agent --codex          # Codex only
 *   npx marketing-agent uninstall        # remove from both
 *   npx marketing-agent --help
 *
 * Claude install — official plugin flow only:
 *   Runs `claude plugin marketplace add https://github.com/gomarble-ai/marketing-agent.git`
 *   then `claude plugin install marketing-agent@marketing-agent`. Uses the explicit HTTPS URL
 *   (not `owner/repo` shorthand) so users whose git config rewrites HTTPS → SSH
 *   don't hit host-key verification errors. If `claude` is not on PATH or a step
 *   fails, prints the equivalent in-session slash commands.
 *
 * Codex install — file copy + personal marketplace (pure fs, works everywhere):
 *   Copies files to ~/.codex/plugins/<name>/ and writes the entry to
 *   ~/.agents/plugins/marketplace.json. Codex auto-discovers on next start.
 */

import {
  cpSync, mkdirSync, existsSync, readFileSync, writeFileSync, rmSync,
} from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { homedir } from 'os';
import { spawnSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = resolve(__dirname, '..');
const NPM_NAME = 'marketing-agent';        // the npx command (npm package name is unchanged)
const PLUGIN_NAME = 'gomarble';
const DISPLAY_NAME = 'GoMarble';
// Earlier releases installed as marketing-agent@marketing-agent; remove it so users don't end up with both.
const LEGACY_PLUGIN_NAME = 'marketing-agent';
const LEGACY_MARKETPLACE_NAME = 'marketing-agent';
// Explicit HTTPS URL (not `owner/repo` shorthand) so users with
// `insteadOf` git config rewriting HTTPS → SSH don't hit "host key
// verification failed" errors on first install. Public-repo install
// works without SSH setup this way.
const MARKETPLACE = 'https://github.com/gomarble-ai/marketing-agent.git';
const MARKETPLACE_NAME = 'gomarble';

// What goes from the npm package into the user's Codex plugin install dir
const COPY_ENTRIES = ['.claude-plugin', '.codex-plugin', '.mcp.json', 'assets', 'commands', 'skills'];

// ─── Argument parsing ────────────────────────────────────────
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  printHelp();
  process.exit(0);
}

const command = (args[0] === 'uninstall') ? 'uninstall' : 'install';
const flags = args.filter(a => a.startsWith('--'));
const noFlags = flags.length === 0;
const wantClaude = noFlags || flags.includes('--claude');
const wantCodex = noFlags || flags.includes('--codex');

if (!wantClaude && !wantCodex) {
  console.error('Nothing to do — pass --claude, --codex, or no flag (both).');
  process.exit(1);
}

// ─── Cross-platform helpers ──────────────────────────────────
const IS_WIN = process.platform === 'win32';

function onPath(bin) {
  const lookup = IS_WIN ? 'where' : 'which';
  const r = spawnSync(lookup, [bin], { encoding: 'utf-8', shell: IS_WIN });
  if (r.status === 0 && r.stdout.trim().length > 0) return true;
  const probe = spawnSync(bin, ['--version'], {
    stdio: 'ignore',
    shell: IS_WIN,
    timeout: 5000,
  });
  return probe.status === 0;
}

function runHostCli(bin, args, opts = {}) {
  const r = spawnSync(bin, args, { stdio: 'inherit', shell: IS_WIN, ...opts });
  return r.status === 0;
}

// ─── Codex helpers (file-copy + personal marketplace; cross-platform) ─
function copyPlugin(target) {
  if (existsSync(target)) rmSync(target, { recursive: true, force: true });
  mkdirSync(target, { recursive: true });
  for (const entry of COPY_ENTRIES) {
    const src = join(PACKAGE_ROOT, entry);
    if (!existsSync(src)) continue;
    cpSync(src, join(target, entry), { recursive: true });
  }
}

function updateCodexMarketplace(targetRelPath) {
  const mpDir = join(homedir(), '.agents', 'plugins');
  mkdirSync(mpDir, { recursive: true });
  const mpFile = join(mpDir, 'marketplace.json');
  let mp = { name: 'personal', plugins: [] };
  if (existsSync(mpFile)) {
    try {
      mp = JSON.parse(readFileSync(mpFile, 'utf-8'));
      if (!Array.isArray(mp.plugins)) mp.plugins = [];
      if (!mp.name) mp.name = 'personal';
    } catch {
      writeFileSync(mpFile + '.bak', readFileSync(mpFile, 'utf-8'));
      mp = { name: 'personal', plugins: [] };
    }
  }
  const entry = {
    name: PLUGIN_NAME,
    source: { source: 'local', path: targetRelPath },
    policy: { installation: 'AVAILABLE', authentication: 'ON_INSTALL' },
    category: 'Productivity',
  };
  const i = mp.plugins.findIndex(p => p && p.name === PLUGIN_NAME);
  if (i >= 0) mp.plugins[i] = entry;
  else mp.plugins.push(entry);
  writeFileSync(mpFile, JSON.stringify(mp, null, 2) + '\n');
  return mpFile;
}

function removeFromCodexMarketplace(name = PLUGIN_NAME) {
  const mpFile = join(homedir(), '.agents', 'plugins', 'marketplace.json');
  if (!existsSync(mpFile)) return;
  try {
    const mp = JSON.parse(readFileSync(mpFile, 'utf-8'));
    if (Array.isArray(mp.plugins)) {
      mp.plugins = mp.plugins.filter(p => p && p.name !== name);
      writeFileSync(mpFile, JSON.stringify(mp, null, 2) + '\n');
    }
  } catch { /* ignore */ }
}

// ─── Help ────────────────────────────────────────────────────
function printHelp() {
  console.log(`
${DISPLAY_NAME} — install for Claude Code + Codex CLI

Usage:
  npx ${NPM_NAME}                  Install to both hosts
  npx ${NPM_NAME} --claude         Claude Code only
  npx ${NPM_NAME} --codex          Codex CLI only
  npx ${NPM_NAME} uninstall        Remove from both
  npx ${NPM_NAME} --help

After install, complete OAuth:
  Claude Code:  /mcp → authorize 'gomarble'
  Codex CLI:    codex mcp login gomarble
`);
}

// ─── Install handlers ────────────────────────────────────────
function printClaudeManualInstall() {
  console.log('  Open Claude Code and run these three slash commands:');
  console.log('');
  console.log(`      /plugin marketplace add ${MARKETPLACE}`);
  console.log(`      /plugin install ${PLUGIN_NAME}@${MARKETPLACE_NAME}`);
  console.log('      /reload-plugins');
  console.log('');
  console.log('  Then run `/mcp` and authorize \'gomarble\'.');
}

function installClaude() {
  console.log('━━ Claude Code ━━');

  if (!onPath('claude')) {
    console.log('  ✗ `claude` CLI not found on PATH.');
    if (IS_WIN) {
      console.log('');
      console.log('  On Windows, this usually means one of:');
      console.log('    1. Claude Code isn\'t installed yet — install from https://claude.com/claude-code');
      console.log(`    2. Claude Code was just installed and this terminal still has the old PATH`);
      console.log(`       — close this window, open a new PowerShell/CMD, and re-run \`npx ${NPM_NAME}\``);
      console.log('    3. Claude Code is installed in WSL but you\'re running in native Windows shell');
      console.log(`       — run \`npx ${NPM_NAME}\` from inside WSL instead`);
      console.log('');
      console.log('  If none of those apply, finish the install manually from inside Claude Code:');
    } else {
      console.log('  Install Claude Code first (https://claude.com/claude-code), then either');
      console.log(`  re-run \`npx ${NPM_NAME} --claude\` or finish from inside Claude Code:`);
    }
    printClaudeManualInstall();
    return;
  }

  removeLegacyClaudeInstall();

  console.log(`  → claude plugin marketplace add ${MARKETPLACE}`);
  if (!runHostCli('claude', ['plugin', 'marketplace', 'add', MARKETPLACE])) {
    console.log('');
    console.log('  ✗ `claude plugin marketplace add` failed.');
    console.log('  Common causes: already added, network issue, or repo access denied.');
    if (IS_WIN) {
      console.log('  On Windows, also check that your shell has internet access and Git is installed.');
    }
    console.log('');
    printClaudeManualInstall();
    return;
  }

  console.log(`  → claude plugin install ${PLUGIN_NAME}@${MARKETPLACE_NAME}`);
  if (!runHostCli('claude', ['plugin', 'install', `${PLUGIN_NAME}@${MARKETPLACE_NAME}`])) {
    console.log('');
    console.log('  ✗ `claude plugin install` failed.');
    console.log('');
    printClaudeManualInstall();
    return;
  }

  console.log(`  ✓ Installed.`);
  console.log(`  Next: open Claude Code, run \`/reload-plugins\`, then \`/mcp\` and authorize 'gomarble'.`);
}

function installCodex() {
  console.log('\n━━ Codex CLI ━━');
  removeLegacyCodexInstall();
  const target = join(homedir(), '.codex', 'plugins', PLUGIN_NAME);
  copyPlugin(target);
  const relPath = `./.codex/plugins/${PLUGIN_NAME}`;
  const mpFile = updateCodexMarketplace(relPath);
  console.log(`  ✓ Files copied: ${target}`);
  console.log(`  ✓ Marketplace entry added/updated: ${mpFile}`);
  console.log(`  Next: restart Codex, enable '${DISPLAY_NAME}' in the Plugins panel, then run 'codex mcp login gomarble'.`);
}

// Quietly remove a pre-rename install (marketing-agent@marketing-agent). No-op when absent.
function removeLegacyClaudeInstall() {
  const u = spawnSync('claude', ['plugin', 'uninstall', `${LEGACY_PLUGIN_NAME}@${LEGACY_MARKETPLACE_NAME}`],
                     { encoding: 'utf-8', shell: IS_WIN });
  const mr = spawnSync('claude', ['plugin', 'marketplace', 'remove', LEGACY_MARKETPLACE_NAME],
                       { encoding: 'utf-8', shell: IS_WIN });
  if (u.status === 0 || mr.status === 0) {
    console.log(`  ✓ Removed the previous ${LEGACY_PLUGIN_NAME} install (now named ${PLUGIN_NAME}).`);
  }
}

function removeLegacyCodexInstall() {
  const legacyTarget = join(homedir(), '.codex', 'plugins', LEGACY_PLUGIN_NAME);
  if (existsSync(legacyTarget)) rmSync(legacyTarget, { recursive: true, force: true });
  removeFromCodexMarketplace(LEGACY_PLUGIN_NAME);
}

// ─── Uninstall handlers ──────────────────────────────────────
function uninstallClaude() {
  console.log('━━ Claude Code ━━');

  if (!onPath('claude')) {
    console.log('  ⚠ `claude` CLI not found. To remove manually, run in Claude Code:');
    console.log(`        /plugin uninstall ${PLUGIN_NAME}@${MARKETPLACE_NAME}`);
    console.log(`        /plugin marketplace remove ${MARKETPLACE_NAME}`);
    return;
  }

  const u = spawnSync('claude', ['plugin', 'uninstall', `${PLUGIN_NAME}@${MARKETPLACE_NAME}`],
                     { encoding: 'utf-8', shell: IS_WIN });
  const mr = spawnSync('claude', ['plugin', 'marketplace', 'remove', MARKETPLACE_NAME],
                       { encoding: 'utf-8', shell: IS_WIN });
  if (u.status === 0) console.log('  ✓ Plugin uninstalled.');
  if (mr.status === 0) console.log('  ✓ Marketplace removed.');
  if (u.status !== 0 && mr.status !== 0) {
    console.log('  (nothing to remove — not installed via plugin flow)');
  }
}

function uninstallCodex() {
  console.log('\n━━ Codex CLI ━━');
  const target = join(homedir(), '.codex', 'plugins', PLUGIN_NAME);
  if (existsSync(target)) {
    rmSync(target, { recursive: true, force: true });
    console.log(`  ✓ Removed ${target}`);
  } else {
    console.log(`  Codex: not installed (skipped)`);
  }
  removeFromCodexMarketplace();
  console.log(`  ✓ Marketplace entry cleared.`);
}

// ─── Run ─────────────────────────────────────────────────────
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`  ${DISPLAY_NAME} — by GoMarble`);
console.log('  The AI agent for paid media teams');
console.log('  https://gomarble.ai');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');

if (command === 'install') {
  console.log(`Installing ${PLUGIN_NAME}...\n`);
  if (wantClaude) installClaude();
  if (wantCodex) installCodex();
  console.log('\nDone.');
}

if (command === 'uninstall') {
  console.log(`Uninstalling ${PLUGIN_NAME}...\n`);
  if (wantClaude) uninstallClaude();
  if (wantCodex) uninstallCodex();
  console.log('\nDone.');
}
