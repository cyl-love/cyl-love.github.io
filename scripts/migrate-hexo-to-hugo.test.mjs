import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

import { convertPost, validatePosts } from './migrate-hexo-to-hugo.mjs'

const sample = await readFile(
  new URL('./fixtures/sample-post.md', import.meta.url),
  'utf8'
)

test('converts Hexo metadata and preserves the legacy URL', () => {
  const result = convertPost(sample, 'sample-post.md')

  assert.equal(result.data.title, '示例文章')
  assert.equal(result.data.url, '/posts/12345.html')
  assert.deepEqual(result.data.tags, ['ctf'])
  assert.deepEqual(result.data.categories, ['Web Security'])
  assert.equal(result.data.date, '2025-07-30 12:30:00')
})

test('rewrites shared Hexo image paths to Hugo static paths', () => {
  const result = convertPost(sample, 'sample-post.md')

  assert.match(result.body, /!\[demo\]\(\/images\/demo\.png\)/)
})

test('rejects duplicate legacy routes', () => {
  const first = convertPost(sample, 'first.md')
  const second = convertPost(sample, 'second.md')

  assert.throws(
    () => validatePosts([first, second]),
    /Duplicate abbrlink 12345: first\.md, second\.md/
  )
})

