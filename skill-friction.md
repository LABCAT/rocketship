# Skill Friction Log — rcl/33-publish-01 (RCL-33)

Skill: `.agents/skills/rocketship-component`
Starting hash: `5db3996f87dbada8bf54ece0d43712984948a103` (repo HEAD on branch base before any RCL-33 edits)

## What changed and why

- **Package rename** (`@labcat/rocketship` → `@labcat2020/rocketship`) invalidated every hardcoded package name in the skill and its reference template, plus the two `.agents/rules` files that document the same package. Updated `SKILL.md`, `references/component-template.md`, `rocketship-overview.mdc`, and `rocketship-themes.mdc` to the new scope in a **separate commit** so skill/process changes are never silently folded into feature work.

## Friction observed

1. **The skill hardcodes the package scope.** `SKILL.md` and `component-template.md` embed `@labcat/rocketship` in story wiring examples rather than deriving it from `packages/base/package.json`. A scope rename required grepping the whole repo. Recommend the skill reference the package by reading `packages/base/package.json` (or a single documented constant) instead of duplicating the name in prose.
2. **No "publish/packaging" section exists in the skill.** The skill covers authoring a component + registering its export, but nothing about what the published tarball must contain (exports map, `files[]`, `publishConfig`). Publishing work (RCL-33) found `files[]` was missing the package `README.md` and `publishConfig.access` was absent. A short "Packaging for release" note would make the skill's scope self-contained for the next release.
3. **Top-of-file banner** (repo HEAD) is the only timestamp anchor; the skill has no per-change note convention. Added this log as the record.