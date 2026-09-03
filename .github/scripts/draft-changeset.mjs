#!/usr/bin/env node
// Drafts a .changeset/<branch-slug>.md file by asking an LLM to summarize
// this PR's diff to the published package's source (src/, minus the demo
// app — see PACKAGE_EXCLUDE_DIRS) as a semver bump + one-paragraph
// description, in changesets' own file format. Runs once per PR (the
// calling workflow skips this script entirely if a changeset was already
// added in this PR), so it never overwrites something a human already
// wrote or edited.
//
// Uses NVIDIA's OpenAI-compatible API Catalog endpoint. Model selection,
// fallback logic, and <think>-block stripping live in nvidia-chat.mjs.

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import { nvidiaChat, requireEnv } from './nvidia-chat.mjs';

const MAX_DIFF_CHARS = 12000;
const PACKAGE_NAME = '@jbpark/use-hooks';
const PACKAGE_DIR = 'src';

// The published package is just `dist` (built from src/hooks + src/index.ts
// — see package.json's "files"). Everything else under src/ is the demo
// app (src/App.tsx, src/demo/**, src/main.tsx, src/index.css) and has zero
// effect on what actually ships, so it's excluded from the diff the model
// sees entirely — no LLM judgment call needed, the diff is just empty for
// a demo-only PR and drafting is skipped below. Relying on the model to
// recognize "this is demo-only, don't draft" was unreliable in practice.
const PACKAGE_EXCLUDE_DIRS = [
  'src/demo',
  'src/App.tsx',
  'src/App.css',
  'src/main.tsx',
  'src/index.css',
];

// The model isn't guaranteed to honor a strict JSON-only instruction, so
// pull the object out of a ```json fenced block if present and fall back to
// parsing the raw content otherwise.
function extractJson(content) {
  const fenced = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1] : content;
  return JSON.parse(raw.trim());
}

function diffBetween(base, head) {
  return execFileSync(
    'git',
    [
      'diff',
      `${base}...${head}`,
      '--',
      PACKAGE_DIR,
      ...PACKAGE_EXCLUDE_DIRS.map(dir => `:!${dir}`),
    ],
    { encoding: 'utf8', maxBuffer: 1024 * 1024 * 20 },
  );
}

async function main() {
  const apiKey = requireEnv('NVIDIA_API_KEY');
  const baseSha = requireEnv('BASE_SHA');
  const headSha = requireEnv('HEAD_SHA');
  const branchSlug = requireEnv('BRANCH_SLUG');

  let diff;
  try {
    diff = diffBetween(baseSha, headSha);
  } catch (err) {
    console.log(`Could not diff ${baseSha}...${headSha}: ${err.message}`);
    return;
  }

  if (!diff.trim()) {
    console.log(
      `No changes under ${PACKAGE_DIR} (outside the demo app) — skipping changeset draft.`,
    );
    return;
  }

  const truncatedDiff =
    diff.length > MAX_DIFF_CHARS
      ? `${diff.slice(0, MAX_DIFF_CHARS)}\n... (truncated)`
      : diff;

  const systemPrompt = [
    'You are a release-notes assistant for a React hooks library',
    `(npm package "${PACKAGE_NAME}") that uses changesets for versioning.`,
    'You will be given a git diff for one pull request.',
    'Respond with ONLY a JSON object, no prose, no markdown code fences,',
    "matching: { \"bump\": \"major\" | \"minor\" | \"patch\", \"summary\": string }.",
    'bump: major = breaking API change, minor = new backward-compatible',
    'hook/export, patch = bug fix, internal refactor, docs, or other',
    'non-breaking change.',
    'summary: one short paragraph (1-3 sentences), imperative present',
    'tense, describing the user-facing effect of this change — this text',
    'is used verbatim as a changelog entry, so do not include prose about',
    'the diff itself, file names, or meta-commentary.',
    'If the diff has no user-facing or API-relevant effect (pure test/demo/',
    'internal-only noise), respond with { "bump": "patch", "summary": "" }.',
  ].join(' ');

  // A drafted changeset is a nice-to-have, not something worth failing the
  // required "draft" check over — if the API is unavailable even after all
  // candidates are exhausted, skip drafting (exit 0) instead of blocking the
  // PR. A human can always add a changeset by hand.
  let result;
  try {
    const content = await nvidiaChat(apiKey, {
      temperature: 0,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `\`\`\`diff\n${truncatedDiff}\n\`\`\`` },
      ],
    });

    result = extractJson(content);
    if (!result || typeof result !== 'object') {
      throw new Error('Model response is not an object');
    }
    if (!['major', 'minor', 'patch'].includes(result.bump)) {
      throw new Error(`Invalid bump type "${result.bump}"`);
    }
  } catch (err) {
    console.log(
      `NVIDIA API unavailable, skipping changeset draft: ${err.message}`,
    );
    return;
  }

  if (!result.summary || !result.summary.trim()) {
    console.log('Model reported no user-facing change — nothing to do.');
    return;
  }

  const filePath = `.changeset/${branchSlug}.md`;
  const fileContent = [
    '---',
    `'${PACKAGE_NAME}': ${result.bump}`,
    '---',
    '',
    result.summary.trim(),
    '',
  ].join('\n');

  fs.writeFileSync(filePath, fileContent);
  console.log(`Wrote ${filePath} (${result.bump}): ${result.summary}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
