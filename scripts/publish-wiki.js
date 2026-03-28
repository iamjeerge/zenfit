#!/usr/bin/env node
/**
 * @file publish-wiki.js
 * @description Publishes the TypeDoc-generated Markdown docs to the GitHub Wiki
 * for the iamjeerge/zenfit repository.
 *
 * Prerequisites:
 *   1. Run `npm run docs` first to generate ./docs/api/
 *   2. Ensure you have write access to the wiki (gh auth login, or set GITHUB_TOKEN)
 *   3. The wiki must be initialised on GitHub (Settings → Wiki → Enable)
 *
 * Usage:
 *   node scripts/publish-wiki.js
 *   # or via npm:
 *   npm run docs:wiki
 */

'use strict';

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const WIKI_REPO = 'https://github.com/iamjeerge/zenfit.wiki.git';
const DOCS_DIR = path.join(__dirname, '..', 'docs', 'api');

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Run a shell command, printing it first, and throw on non-zero exit.
 * @param {string} cmd - Shell command to execute
 * @param {string} [cwd] - Working directory (defaults to process.cwd())
 */
function run(cmd, cwd = process.cwd()) {
  console.log(`$ ${cmd}`);
  execSync(cmd, { cwd, stdio: 'inherit' });
}

/**
 * Recursively collect all .md files under a directory.
 * @param {string} dir - Directory to walk
 * @returns {string[]} Absolute paths to all Markdown files
 */
function collectMarkdownFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectMarkdownFiles(full));
    } else if (entry.name.endsWith('.md')) {
      results.push(full);
    }
  }
  return results;
}

// ── Main ─────────────────────────────────────────────────────────────────────

if (!fs.existsSync(DOCS_DIR)) {
  console.error('❌  docs/api/ not found. Run `npm run docs` first.');
  process.exit(1);
}

// Clone the wiki into a temp directory
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'zenfit-wiki-'));
console.log(`\n📂  Cloning wiki to ${tmpDir} …`);

try {
  run(`git clone ${WIKI_REPO} .`, tmpDir);
} catch {
  // Wiki may be empty on first run — init a new repo
  console.warn('⚠️  Could not clone wiki (may be blank). Initialising fresh repo.');
  run('git init', tmpDir);
  run(`git remote add origin ${WIKI_REPO}`, tmpDir);
}

// Copy all generated .md files into the wiki root (preserving sub-dirs)
console.log('\n📋  Copying docs …');
const mdFiles = collectMarkdownFiles(DOCS_DIR);
for (const src of mdFiles) {
  const rel = path.relative(DOCS_DIR, src);
  const dest = path.join(tmpDir, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  console.log(`   copied: ${rel}`);
}

// Build a Home.md index from the top-level files
const topLevelMd = fs
  .readdirSync(tmpDir)
  .filter((f) => f.endsWith('.md') && f !== 'Home.md')
  .sort();

const homeLines = [
  '# ZenFit — API Documentation',
  '',
  '> Auto-generated from JSDoc comments via [TypeDoc](https://typedoc.org). ',
  `> Last updated: ${new Date().toUTCString()}`,
  '',
  '## Modules',
  '',
  ...topLevelMd.map((f) => `- [${f.replace('.md', '')}](${f.replace('.md', '')})`),
  '',
  '## Architecture Overview',
  '',
  'See [ARCHITECTURE.md](https://github.com/iamjeerge/zenfit/blob/main/docs/ARCHITECTURE.md) for a high-level design guide.',
];

fs.writeFileSync(path.join(tmpDir, 'Home.md'), homeLines.join('\n'), 'utf8');
console.log('   generated: Home.md');

// Commit and push
console.log('\n🚀  Pushing to wiki …');
run('git add -A', tmpDir);
run('git config user.email "ci@zenfit.app"', tmpDir);
run('git config user.name "ZenFit Docs Bot"', tmpDir);

const commitMsg = `docs: auto-update API reference ${new Date().toISOString().slice(0, 10)}`;
try {
  run(`git commit -m "${commitMsg}"`, tmpDir);
  run('git push origin HEAD:master --force', tmpDir);
  console.log('\n✅  Wiki updated successfully!');
  console.log(`📖  View at: https://github.com/iamjeerge/zenfit/wiki`);
} catch {
  console.warn('\n⚠️  Nothing to push (no changes detected).');
}
