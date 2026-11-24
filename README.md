# vin-meter

[![ci](https://github.com/VinVirtual/vin-meter/actions/workflows/ci.yml/badge.svg)](https://github.com/VinVirtual/vin-meter/actions/workflows/ci.yml) [![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

See where your Claude Code tokens and money go, from the session transcripts already on your machine.

vin-meter reads `~/.claude/projects/**/*.jsonl`, counts each API response once, and reports
estimated cost and tokens (input, output, cache writes, cache reads, cache hit rate) by day,
project, model, tool and task category. Output is a terminal report, JSON or CSV. It is
read-only, makes no network requests and calls no model.

It is a [Claude Code](https://claude.com/claude-code) skill: `SKILL.md` tells Claude when and how
to run it ("what did I spend this week?", "which project uses the most tokens?", "is caching
working?"). It works the same by hand.

## Install

As a Claude Code plugin from the [VinSkills](https://github.com/VinVirtual/vinskills) marketplace:

```bash
claude plugin marketplace add VinVirtual/vinskills
```

```
/plugin install vin-meter@vinskills        # this skill alone
/plugin install vin-core@vinskills         # or all eight vin-core skills
```

Or as a plain skill folder:

```bash
git clone https://github.com/VinVirtual/vin-meter ~/.claude/skills/vin-meter
~/.claude/skills/vin-meter/check_env.sh
```

Needs Node.js 22 or newer. Nothing else.

## Quick start

```bash
node scripts/vin-meter.mjs                 # last 7 days
node scripts/vin-meter.mjs today
node scripts/vin-meter.mjs 30d --project my-app
node scripts/vin-meter.mjs month --json > meter.json
node scripts/vin-meter.mjs --from 2026-11-01 --to 2026-11-15 --csv spend.csv
```

Periods: `today`, `yesterday`, `7d`, `30d`, `month`, `all`, `<N>d`, `<N>h`. Options: `--dir`
(another transcripts folder), `--pricing <file>`, `--limit <n>` rows per table, `--tz <zone>`.

## How it works

| Stage | What happens |
| --- | --- |
| 1. Find | Every `*.jsonl` under the transcripts folder, up to six folders deep, symlinks not followed. Files older than the period are skipped. |
| 2. De-duplicate | Lines from the same response (same session and message id) are merged, keeping the largest value of each usage field, so a response counts once. |
| 3. Tasks | Each user prompt starts a task. Its category comes from the prompt's words (fix, test, refactor, docs, review, add/build), else from the tools its turns used. |
| 4. Price | Tokens times the rates in `scripts/lib/pricing.json` (per model, with cache write and cache read rates). Override with `--pricing`. Unknown models are counted but listed as "Not priced". |
| 5. Report | Totals plus tables by day, project, model, tool and category; or JSON, or CSV with formula-like cells neutralised. |

The details and the JSON shape are in [references/how-it-counts.md](references/how-it-counts.md).

## Limits

- Costs are list-price estimates, not your invoice; plan discounts are ignored.
- Only what is in the transcripts on this machine. Deleted sessions and other machines are not included.
- The task category is a rule-based label, good for proportions, not a judgement of each task.

## Tests

```bash
npm test
```

The suite runs offline with Node's built-in test runner. CI runs it on every push, together
with [skill-ci](https://github.com/VinVirtual/skill-ci), which lints the SKILL.md, README,
licence, secrets and scripts.

## Part of VinSkills

vin-meter is one of the eight `vin-core` skills in [VinSkills](https://github.com/VinVirtual/vinskills),
my Claude Code marketplace: [vin-house-build](https://github.com/VinVirtual/vin-house-build),
[vin-agent-orchestration](https://github.com/VinVirtual/vin-agent-orchestration),
[vin-site-qa](https://github.com/VinVirtual/vin-site-qa), [vin-meter](https://github.com/VinVirtual/vin-meter),
[vin-navigator](https://github.com/VinVirtual/vin-navigator), [vin-docs](https://github.com/VinVirtual/vin-docs),
[vin-squeeze](https://github.com/VinVirtual/vin-squeeze) and [vin-scriptlens](https://github.com/VinVirtual/vin-scriptlens).

## Licence

MIT, see [LICENSE](LICENSE).
