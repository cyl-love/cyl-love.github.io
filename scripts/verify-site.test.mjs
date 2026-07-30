import assert from 'node:assert/strict'
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'

import { collectImageReferences, verifySite } from './verify-site.mjs'

async function writeSectionIndex(directory, title) {
  await mkdir(directory, { recursive: true })
  await writeFile(path.join(directory, '_index.md'), `---\ntitle: "${title}"\n---\n`)
}

test('collects Markdown and HTML image references', () => {
  const markdown = [
    '![first](/images/first.png)',
    '<img src="/images/second.jpg" alt="second">',
    '![external](https://example.com/external.png)',
  ].join('\n')

  assert.deepEqual(collectImageReferences(markdown), [
    '/images/first.png',
    '/images/second.jpg',
  ])
})

test('keeps balanced parentheses inside Markdown image paths', () => {
  assert.deepEqual(
    collectImageReferences('![avatar](/images/milkdragon (1).jpg)'),
    ['/images/milkdragon (1).jpg']
  )
})

test('reports missing legacy pages and local images with their source file', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'cyl-site-audit-'))
  try {
    await writeSectionIndex(path.join(root, 'content', 'blog'), '文章')
    await writeSectionIndex(path.join(root, 'content', 'blog', 'ctf'), 'CTF')
    await mkdir(path.join(root, 'public'), { recursive: true })
    await mkdir(path.join(root, 'static', 'images'), { recursive: true })
    await writeFile(
      path.join(root, 'content', 'blog', 'ctf', 'post.md'),
      [
        '---',
        'title: "Demo"',
        'date: "2025-01-01 00:00:00"',
        'url: "/posts/123.html"',
        'abbrlink: "123"',
        '---',
        '![missing](/images/missing.png)',
      ].join('\n')
    )

    await assert.rejects(
      () => verifySite(root),
      (error) => {
        assert.match(error.message, /post\.md: missing generated route \/posts\/123\.html/)
        assert.match(error.message, /post\.md: missing image \/images\/missing\.png/)
        return true
      }
    )
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('allows valid drafts without requiring a generated page or search entry', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'cyl-site-draft-'))
  try {
    await writeSectionIndex(path.join(root, 'content', 'blog'), '文章')
    await mkdir(path.join(root, 'public', 'about'), { recursive: true })
    await mkdir(path.join(root, 'public', 'link'), { recursive: true })
    await writeFile(
      path.join(root, 'content', 'blog', 'draft.md'),
      [
        '---',
        'title: "Draft"',
        'date: "2026-07-30 12:34:56"',
        'url: "/posts/20260730123456.html"',
        'abbrlink: "20260730123456"',
        'draft: true',
        '---',
        'Draft body',
      ].join('\n')
    )
    await writeFile(path.join(root, 'public', 'index.html'), '')
    await writeFile(path.join(root, 'public', 'index.json'), '[]')
    await writeFile(path.join(root, 'public', '404.html'), '')
    await writeFile(path.join(root, 'public', 'about', 'index.html'), '')
    await writeFile(path.join(root, 'public', 'link', 'index.html'), '')

    const result = await verifySite(root)

    assert.equal(result.posts, 0)
    assert.equal(result.drafts, 1)
    assert.equal(result.legacyRoutes, 0)
    assert.equal(result.searchEntries, 0)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('reports a content section without a valid index', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'cyl-section-audit-'))
  try {
    await writeSectionIndex(path.join(root, 'content', 'blog'), '文章')
    const directory = path.join(root, 'content', 'blog', '代码审计')
    await mkdir(directory, { recursive: true })
    await writeFile(
      path.join(directory, '_index.md'),
      '\\---\ntitle: "代码审计"\n\\---\n'
    )

    await assert.rejects(
      () => verifySite(root),
      /content\/blog\/代码审计\/_index\.md: Markdown does not start with YAML front matter/
    )
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('requires an abbrlink that matches the stable post URL', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'cyl-abbrlink-audit-'))
  try {
    await writeSectionIndex(path.join(root, 'content', 'blog'), '文章')
    await writeFile(
      path.join(root, 'content', 'blog', 'missing.md'),
      [
        '---',
        'title: "Missing"',
        'date: "2026-07-30 12:34:56"',
        'url: "/posts/123.html"',
        'draft: true',
        '---',
      ].join('\n')
    )
    await writeFile(
      path.join(root, 'content', 'blog', 'mismatch.md'),
      [
        '---',
        'title: "Mismatch"',
        'date: "2026-07-30 12:34:56"',
        'url: "/posts/456.html"',
        'abbrlink: "789"',
        'draft: true',
        '---',
      ].join('\n')
    )

    await assert.rejects(
      () => verifySite(root),
      (error) => {
        assert.match(error.message, /missing\.md: missing abbrlink/)
        assert.match(error.message, /mismatch\.md: abbrlink 789 does not match url \/posts\/456\.html/)
        return true
      }
    )
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})
