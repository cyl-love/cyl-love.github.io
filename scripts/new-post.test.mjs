import assert from 'node:assert/strict'
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'

import { createPost } from './new-post.mjs'

test('creates a draft article with Chinese metadata and a stable legacy URL', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'cyl-new-post-'))
  try {
    const result = await createPost({
      root,
      title: 'Hugo 写作测试',
      category: 'Web 安全',
      tags: ['Hugo', '博客'],
      now: new Date('2026-07-30T12:34:56+08:00'),
    })

    assert.equal(result.id, '20260730123456')
    assert.equal(
      path.relative(root, result.filePath).replaceAll('\\', '/'),
      'content/blog/Web-安全/Hugo-写作测试.md'
    )

    const markdown = await readFile(result.filePath, 'utf8')
    assert.match(markdown, /title: "Hugo 写作测试"/)
    assert.match(markdown, /date: "2026-07-30 12:34:56"/)
    assert.match(markdown, /tags: \["Hugo","博客"\]/)
    assert.match(markdown, /categories: \["Web 安全"\]/)
    assert.match(markdown, /url: "\/posts\/20260730123456\.html"/)
    assert.match(markdown, /abbrlink: "20260730123456"/)
    assert.match(markdown, /draft: true/)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('increments the article id when the timestamp id already exists', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'cyl-new-post-'))
  try {
    const directory = path.join(root, 'content', 'blog', 'old')
    await mkdir(directory, { recursive: true })
    await writeFile(
      path.join(directory, 'existing.md'),
      '---\ntitle: "Old"\nabbrlink: "20260730123456"\n---\n'
    )

    const result = await createPost({
      root,
      title: 'New post',
      category: 'Notes',
      tags: [],
      now: new Date('2026-07-30T12:34:56+08:00'),
    })

    assert.equal(result.id, '20260730123457')
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('rejects a missing article title', async () => {
  await assert.rejects(
    () => createPost({ root: process.cwd(), title: '  ' }),
    /文章标题不能为空/
  )
})
