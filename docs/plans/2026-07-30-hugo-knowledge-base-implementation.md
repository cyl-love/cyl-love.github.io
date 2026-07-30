# Hugo Knowledge Base Blog Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the current Hexo + Butterfly site with a Hugo knowledge-base blog matching the structure and interaction model of `yuy0ung.github.io`, while preserving all existing content, images, metadata, and legacy post URLs.

**Architecture:** Use a self-contained Hugo site with local layouts, CSS, and JavaScript derived from the reference repository's information architecture. A deterministic Node.js migration tool converts Hexo posts and assets into Hugo content, and a verification tool audits generated routes and local asset references after every build.

**Tech Stack:** Hugo Extended, Go templates, HTML, CSS, vanilla JavaScript, Node.js built-in test runner, GitHub Pages Actions

---

## Repository Constraint

The current directory has no `.git` metadata, so a dedicated worktree and commit steps are not currently possible. Do not initialize Git implicitly. Run each verification checkpoint, and create commits only after the user restores or explicitly initializes the source repository.

### Task 1: Add Migration Tests

**Files:**
- Create: `scripts/migrate-hexo-to-hugo.test.mjs`
- Create: `scripts/fixtures/sample-post.md`

**Step 1: Write the failing metadata conversion test**

Cover these behaviors with `node:test` and `node:assert/strict`:

```js
test('converts Hexo metadata and preserves the legacy URL', () => {
  const result = convertPost(sample, 'sample.md')
  assert.equal(result.data.url, '/posts/12345.html')
  assert.deepEqual(result.data.tags, ['ctf'])
  assert.deepEqual(result.data.categories, ['Web Security'])
})
```

**Step 2: Write the failing image rewrite test**

```js
test('rewrites shared Hexo image paths to Hugo static paths', () => {
  assert.match(convertPost(sample, 'sample.md').body, /!\[demo\]\(\/images\/demo.png\)/)
})
```

**Step 3: Run the tests and verify failure**

Run: `node --test scripts/migrate-hexo-to-hugo.test.mjs`

Expected: FAIL because `migrate-hexo-to-hugo.mjs` does not exist.

### Task 2: Implement Deterministic Content Migration

**Files:**
- Create: `scripts/migrate-hexo-to-hugo.mjs`
- Create: `scripts/lib/front-matter.mjs`
- Create: `scripts/lib/slug.mjs`
- Modify: `package.json`

**Step 1: Implement a small YAML-front-matter parser for current fields**

Support scalar values and one-line/list representations used by `title`, `date`, `tags`, `categories`, and `abbrlink`. Preserve unknown metadata instead of dropping it.

**Step 2: Implement stable migration rules**

- Read UTF-8 Markdown from `source/_posts/`.
- Normalize `tags` and `categories` to arrays.
- Use the first category as the Hugo section directory, with `uncategorized` fallback.
- Set `url` to `/posts/<abbrlink>.html`.
- Rewrite `../images/` and `/images/` references to `/images/`.
- Copy, never mutate, original Hexo Markdown.
- Fail on duplicate `abbrlink` values.

**Step 3: Add package scripts**

```json
{
  "scripts": {
    "migrate": "node scripts/migrate-hexo-to-hugo.mjs",
    "test": "node --test scripts/*.test.mjs",
    "build": "hugo --minify",
    "serve": "hugo server --disableFastRender"
  }
}
```

**Step 4: Run tests**

Run: `npm test`

Expected: all migration tests PASS.

**Step 5: Run migration**

Run: `npm run migrate`

Expected: 20 posts written below `content/blog/`, no duplicate legacy URL, and all files under `source/images/` copied to `static/images/`.

### Task 3: Create Hugo Site Configuration and Content Roots

**Files:**
- Create: `hugo.toml`
- Create: `content/_index.md`
- Create: `content/blog/_index.md`
- Create: `content/about/index.md`
- Create: `content/link/index.md`
- Create: `data/friends.yaml`
- Create: `archetypes/default.md`

**Step 1: Configure production identity and outputs**

Set:

```toml
baseURL = 'https://cyl-love.github.io/'
languageCode = 'zh-CN'
title = 'cyl 的知识库'
enableRobotsTXT = true

[outputs]
home = ['HTML', 'JSON']

[markup.goldmark.renderer]
unsafe = true
```

Also configure highlight classes and a six-level table of contents.

**Step 2: Create section pages**

Use the existing about-page copy and `source/_data/link.yml` data. Do not invent biography or friend descriptions.

**Step 3: Verify configuration**

Run: `hugo config`

Expected: valid configuration with `baseURL` set to `https://cyl-love.github.io/`.

### Task 4: Build the Hugo Layout System

**Files:**
- Create: `layouts/_default/baseof.html`
- Create: `layouts/index.html`
- Create: `layouts/_default/single.html`
- Create: `layouts/_default/list.html`
- Create: `layouts/_default/terms.html`
- Create: `layouts/_default/taxonomy.html`
- Create: `layouts/404.html`
- Create: `layouts/index.json.json`
- Create: `layouts/partials/head.html`
- Create: `layouts/partials/header.html`
- Create: `layouts/partials/sidebar-left.html`
- Create: `layouts/partials/sidebar-right.html`
- Create: `layouts/partials/tree.html`
- Create: `layouts/partials/footer.html`
- Create: `layouts/partials/icon.html`

**Step 1: Build the semantic shell**

Use `header`, `nav`, `main`, `article`, and `aside` landmarks. Include a skip link and visible keyboard focus states.

**Step 2: Build the home tree**

Render category groups and article rows with title, summary metadata, date, and dotted leader. Empty categories must not render.

**Step 3: Build article layout**

Render the active article path in the left tree, metadata and Markdown in the center, and `.TableOfContents` on the right.

**Step 4: Build list, taxonomy, friend, and 404 views**

Keep these views visually consistent with the document surface; do not introduce card grids.

**Step 5: Build JSON search output**

Each entry must contain `title`, `summary`, plain-text `content`, `link`, `date`, `categories`, and `tags`.

### Task 5: Implement the Visual System

**Files:**
- Create: `assets/css/main.css`
- Create: `static/avatar.jpg`
- Create: `static/favicon.ico`

**Step 1: Add design tokens**

Define light/dark variables for background, sidebar, text, muted text, borders, links, focus, code, and selection colors.

**Step 2: Implement desktop geometry**

- 60px sticky header.
- 250px sticky left navigation.
- Fluid center column capped near 900px.
- 250px sticky right TOC.
- Thin neutral separators and 6px-or-smaller control radii.

**Step 3: Implement content typography**

Support long Chinese titles, tables, blockquotes, images, inline code, fenced code, nested lists, and heading anchors without horizontal overflow.

**Step 4: Implement responsive behavior**

At the mobile breakpoint, hide sidebars, reduce content padding, retain 44px touch targets, and keep title/search/theme controls on one non-overlapping header row.

**Step 5: Copy approved identity assets**

Use the current `source/images/1.jpg` as avatar/favicon only if it is the same visible identity asset currently configured by Butterfly. Do not copy Yuy0ung's avatar.

### Task 6: Add Search, Navigation, Theme, and Code Interactions

**Files:**
- Create: `assets/js/main.js`
- Modify: `layouts/partials/head.html`
- Modify: `layouts/_default/baseof.html`

**Step 1: Add theme initialization**

Apply the stored preference before first paint; otherwise use `prefers-color-scheme`.

**Step 2: Add tree navigation**

Use delegated button events, `aria-expanded`, and `hidden`. Automatically expand the current article ancestry.

**Step 3: Add modal search**

Lazy-load `/index.json`, filter locally, cap rendered results, escape inserted text, and support ArrowUp, ArrowDown, Enter, and Escape.

**Step 4: Add code-copy controls**

Use `navigator.clipboard.writeText`, expose a short success state via `aria-live`, and leave code selectable if clipboard access fails.

**Step 5: Add TOC scroll state**

Use `IntersectionObserver` to highlight the current heading without mutating the URL during normal reading.

### Task 7: Add Migration and Build Audits

**Files:**
- Create: `scripts/verify-site.mjs`
- Create: `scripts/verify-site.test.mjs`
- Modify: `package.json`

**Step 1: Write failing verifier tests**

Test missing generated legacy URLs, duplicate routes, missing image files, unsafe root-relative internal links, and absent expected page titles.

**Step 2: Implement verifier**

Compare migrated content against `public/` and report each missing article or asset with the source Markdown path.

**Step 3: Add verification script**

```json
{
  "scripts": {
    "verify": "npm test && npm run build && node scripts/verify-site.mjs"
  }
}
```

**Step 4: Run full verification**

Run: `npm run verify`

Expected: 20/20 posts, 20/20 legacy routes, and 0 missing referenced local images.

### Task 8: Add GitHub Pages Deployment

**Files:**
- Create: `.github/workflows/hugo.yml`
- Create: `.gitignore`

**Step 1: Add official Pages workflow**

Use `actions/checkout`, `peaceiris/actions-hugo` or the official Hugo setup action with a pinned Hugo Extended version, `actions/configure-pages`, `actions/upload-pages-artifact`, and `actions/deploy-pages`.

**Step 2: Configure ignored outputs**

Ignore `public/`, `resources/_gen/`, `.hugo_build.lock`, and local editor files. Do not ignore content or static images.

**Step 3: Validate workflow syntax**

Parse `.github/workflows/hugo.yml` with the available YAML parser or GitHub CLI before deployment.

### Task 9: Browser Verification and Final Audit

**Files:**
- Modify as required by verified rendering defects only.

**Step 1: Start Hugo server**

Run: `hugo server --bind 127.0.0.1 --port 1313 --disableFastRender`

Expected: server stays available at `http://127.0.0.1:1313/`.

**Step 2: Verify desktop at 1440x900**

Check homepage, one long article, one image-heavy article, about, friends, taxonomy, search modal, theme switch, tree expansion, current TOC state, and console errors.

**Step 3: Verify mobile at 390x844**

Check the same primary flows, plus no horizontal overflow, clipped title, overlapping buttons, or hidden search exit control.

**Step 4: Check canvas and media pixels where applicable**

Confirm avatar and article images are nonblank and correctly framed. The site has no required canvas element; assert none was unintentionally introduced.

**Step 5: Run the final command gate**

Run: `npm run verify`

Expected: all tests and audits PASS after the final browser-driven fixes.

**Step 6: Record unresolved deployment prerequisite**

If `.git` is still absent, report that local implementation and build are verified but pushing to GitHub Pages requires restoring or initializing the source repository. Do not claim online deployment.
