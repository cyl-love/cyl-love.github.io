# Hugo Publishing Workflow Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a reliable Hugo article creation and GitHub Actions publishing workflow for daily use.

**Architecture:** Node.js scripts provide cross-platform article creation and guarded Git publishing. GitHub Actions remains the only production builder, while local verification shares the same tests and Hugo build checks.

**Tech Stack:** Hugo Extended 0.164.0, Node.js 22, Node test runner, Git, GitHub Actions

---

### Task 1: Article creation command

**Files:**
- Create: `scripts/new-post.mjs`
- Create: `scripts/new-post.test.mjs`
- Modify: `package.json`

**Steps:**
1. Write tests for required title, Chinese metadata, deterministic file creation and ID collision handling.
2. Run `node --test scripts/new-post.test.mjs` and confirm the missing implementation fails.
3. Implement argument parsing, safe paths, existing-ID discovery and YAML front matter generation.
4. Add `npm run new` and rerun the tests.

### Task 2: Guarded publishing command

**Files:**
- Create: `scripts/deploy.mjs`
- Create: `scripts/deploy.test.mjs`
- Modify: `package.json`

**Steps:**
1. Write tests for Git preflight checks and no-change behavior.
2. Implement `verify -> git add -> git diff -> git commit -> git push origin main` with explicit failures.
3. Add `npm run deploy` and rerun the tests.

### Task 3: Repository boundary and documentation

**Files:**
- Modify: `.gitignore`
- Modify: `README.md`
- Modify: `archetypes/default.md`

**Steps:**
1. Exclude generated output, tool binaries, Hexo deployment cache, duplicate legacy project directories and legacy theme dependencies.
2. Document installation, article editing, drafts, images, preview, verification, publishing, and common maintenance tasks.
3. Align the default Hugo archetype with the supported front matter.

### Task 4: Attach remote history

**Files:**
- Create locally: `.git/`

**Steps:**
1. Initialize `main`, add `origin`, fetch `origin/main` and attach the remote history without overwriting the Hugo working tree.
2. Inspect all staged additions, modifications and deletions.
3. Commit the Hugo migration locally after tests pass.
4. Check the GitHub Pages source before any push that could affect the live site.

### Task 5: End-to-end verification

**Steps:**
1. Run `npm run verify` and require all unit and site checks to pass.
2. Run an article-creation smoke test in a temporary directory.
3. Audit `git status`, ignored files, workflow syntax and remote tracking.
4. Push only when GitHub Pages is configured for GitHub Actions; otherwise leave an exact one-step handoff.
