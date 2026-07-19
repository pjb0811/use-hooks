#!/usr/bin/env node
// Changelog automation for .github/workflows/changelog-develop.yml.
// Asks a GitHub Models chat completion for a semver bump hint + Keep a
// Changelog (https://keepachangelog.com/en/1.1.0/) style bullets for the
// diff between two commits, then merges that into the "## [Unreleased]"
// section of CHANGELOG.md only. package.json is never touched here — the
// actual version bump happens later, on main, via promote-changelog.mjs.
// Exits non-zero on failure, which fails the workflow run (no changelog
// commit that time).

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const MODEL = process.env.GITHUB_MODELS_MODEL || 'openai/gpt-4o-mini';
const API_URL = 'https://models.github.ai/inference/chat/completions';
// GitHub Models caps gpt-4o-mini requests at 8000 tokens total (system +
// user prompt). Code/diff text tokenizes denser than prose (~2-3 chars per
// token because of punctuation-heavy syntax), so keep this well under the
// naive char-count-only budget that used to live here (30000 chars, which
// triggered 413s on larger diffs).
const MAX_DIFF_CHARS = 12000;
const CHANGELOG_PATH = 'CHANGELOG.md';
const PKG_PATH = 'package.json';

const CATEGORY_ORDER = [
  ['added', 'Added'],
  ['changed', 'Changed'],
  ['deprecated', 'Deprecated'],
  ['removed', 'Removed'],
  ['fixed', 'Fixed'],
  ['security', 'Security'],
];
const CATEGORY_KEYS = CATEGORY_ORDER.map(([key]) => key);
const SEVERITY = { patch: 0, minor: 1, major: 2 };
const BUMP_MARKER_RE = /<!-- next-bump: (major|minor|patch) -->/;

const token = requireEnv('GITHUB_TOKEN');
const afterSha = requireEnv('AFTER_SHA');
const beforeSha = resolveBeforeSha(process.env.BEFORE_SHA, afterSha);

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

function resolveBeforeSha(before, after) {
  if (before && !/^0+$/.test(before)) return before;
  return git(['rev-parse', `${after}~1`]).trim();
}

function git(args) {
  return execFileSync('git', args, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
}

function diff() {
  let d;
  try {
    d = git(['diff', '--find-renames=30%', beforeSha, afterSha, '--', '.', ':(exclude)CHANGELOG.md', ':(exclude)pnpm-lock.yaml', ':(exclude)dist']);
  } catch {
    return '';
  }
  if (d.length > MAX_DIFF_CHARS) {
    d = `${d.slice(0, MAX_DIFF_CHARS)}\n... (diff truncated)`;
  }
  return d;
}

function extractJson(content) {
  const fenced = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1] : content;
  return JSON.parse(raw.trim());
}

function validateResult(result) {
  if (!result || typeof result !== 'object') throw new Error('Model response is not an object');
  if (!Object.hasOwn(SEVERITY, result.bump)) throw new Error(`Invalid bump type "${result.bump}"`);
  if (!result.changes || typeof result.changes !== 'object') throw new Error('Missing changes object');
  for (const [key, items] of Object.entries(result.changes)) {
    if (!Array.isArray(items) || items.some(item => typeof item !== 'string' || !item.trim())) {
      throw new Error(`Invalid entries for category "${key}"`);
    }
    if (!CATEGORY_KEYS.includes(key)) {
      console.warn(`Unknown changelog category "${key}", folding into "changed"`);
      result.changes.changed = [...(result.changes.changed || []), ...items];
      delete result.changes[key];
    }
  }
  const hasAny = CATEGORY_KEYS.some(key => Array.isArray(result.changes[key]) && result.changes[key].length > 0);
  return hasAny ? result : null;
}

function ensureChangelogSkeleton(pkgName) {
  if (!fs.existsSync(CHANGELOG_PATH)) {
    fs.writeFileSync(CHANGELOG_PATH, `# ${pkgName}\n\n## [Unreleased]\n`);
    return;
  }
  const content = fs.readFileSync(CHANGELOG_PATH, 'utf8');
  if (/^## \[Unreleased\]/m.test(content)) return;
  const lines = content.split('\n');
  let insertAt = 1;
  while (insertAt < lines.length && lines[insertAt].trim() === '') insertAt++;
  lines.splice(insertAt, 0, '## [Unreleased]', '');
  fs.writeFileSync(CHANGELOG_PATH, lines.join('\n'));
}

function findUnreleasedBlock(lines) {
  const idx = lines.findIndex(l => l.trim() === '## [Unreleased]');
  if (idx === -1) throw new Error('CHANGELOG.md missing a "## [Unreleased]" heading');
  let end = lines.length;
  for (let i = idx + 1; i < lines.length; i++) {
    if (lines[i].startsWith('## ')) {
      end = i;
      break;
    }
  }
  return { idx, end };
}

function parseCategories(blockLines) {
  const map = {};
  let current = null;
  for (const line of blockLines) {
    const cat = line.match(/^### (.+)$/);
    if (cat) {
      current = cat[1].trim();
      map[current] = map[current] || [];
      continue;
    }
    const bullet = line.match(/^- (.+)$/);
    if (bullet && current) map[current].push(bullet[1].trim());
  }
  return map;
}

function currentBump(blockLines) {
  const match = blockLines.join('\n').match(BUMP_MARKER_RE);
  return match ? match[1] : null;
}

function renderUnreleasedBody(bump, categories) {
  const out = [`<!-- next-bump: ${bump} -->`, ''];
  for (const [, label] of CATEGORY_ORDER) {
    const items = categories[label];
    if (!items || items.length === 0) continue;
    out.push(`### ${label}`, '');
    for (const item of items) out.push(`- ${item}`);
    out.push('');
  }
  while (out.length && out[out.length - 1] === '') out.pop();
  out.push('');
  return out;
}

function applyChangelog(result) {
  const pkg = JSON.parse(fs.readFileSync(PKG_PATH, 'utf8'));
  ensureChangelogSkeleton(pkg.name);

  const content = fs.readFileSync(CHANGELOG_PATH, 'utf8');
  const lines = content.split('\n');
  const { idx, end } = findUnreleasedBlock(lines);
  const blockLines = lines.slice(idx + 1, end);

  const existingBump = currentBump(blockLines);
  const newBump = existingBump && SEVERITY[existingBump] > SEVERITY[result.bump] ? existingBump : result.bump;

  const categories = parseCategories(blockLines);
  for (const [key, label] of CATEGORY_ORDER) {
    const items = result.changes[key];
    if (!items || items.length === 0) continue;
    categories[label] = categories[label] || [];
    for (const item of items) {
      if (!categories[label].includes(item)) categories[label].push(item);
    }
  }

  const body = renderUnreleasedBody(newBump, categories);
  lines.splice(idx + 1, end - (idx + 1), ...body);
  fs.writeFileSync(CHANGELOG_PATH, lines.join('\n'));
}

async function main() {
  const d = diff();
  if (!d.trim()) {
    console.log('No relevant changes in this push — nothing to do.');
    return;
  }

  const pkg = JSON.parse(fs.readFileSync(PKG_PATH, 'utf8'));

  const systemPrompt = [
    'You are a release-notes assistant for a single-package npm library that',
    'follows the Keep a Changelog format (https://keepachangelog.com/en/1.1.0/).',
    'You will be given a git diff between two commits on the develop branch.',
    'Respond with ONLY a JSON object, no prose, no markdown code fences,',
    "matching: { bump: 'major' | 'minor' | 'patch', changes: { added?:",
    'string[]; changed?: string[]; deprecated?: string[]; removed?: string[];',
    'fixed?: string[]; security?: string[]; } }',
    'Decide a semver `bump`: major = breaking API change, minor = new',
    'backward-compatible hook/feature/export, patch = bug fix, internal',
    'refactor, docs, or other non-breaking change.',
    '`changes` groups the update into Keep a Changelog categories — only',
    'include the categories that actually apply; each value is an array of',
    'short bullet strings (no leading "- ", that is added automatically).',
    'Write bullet text in English, imperative present tense (e.g. "add',
    '<x>", "fix <y>"), lowercase start, no trailing period — matching this',
    "repository's commit-message convention style.",
    'Only include entries that have a real, user-facing/API-relevant, or',
    'meaningfully-affects-contributors change; omit anything that is purely',
    'internal/test-only noise with no one who would care to read about it.',
    'The `changes` object keys MUST be exactly one of: added, changed,',
    'deprecated, removed, fixed, security — never invent another key (e.g.',
    'for a dependency bump, use "changed", not "devDependencies" or',
    '"dependencies").',
    'If there is truly nothing worth noting, respond with',
    '{"bump":"patch","changes":{}}.',
  ].join(' ');

  const userPrompt = `Package: ${pkg.name} (current version ${pkg.version})\n\n\`\`\`diff\n${d}\n\`\`\``;

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`GitHub Models request failed: ${response.status} ${response.statusText} — ${await response.text()}`);
  }

  const body = await response.json();
  const content = body.choices?.[0]?.message?.content;
  if (!content) throw new Error('GitHub Models response missing choices[0].message.content');

  const result = validateResult(extractJson(content));
  if (!result) {
    console.log('Model reported no user-facing changes — nothing to do.');
    return;
  }

  applyChangelog(result);
  console.log(`Updated CHANGELOG.md [Unreleased] section (bump: ${result.bump})`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
