import assert from 'node:assert/strict'
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const SCRIPT_PATH = fileURLToPath(new URL('./new-section.mjs', import.meta.url))

function runSection(root, sectionPath) {
  return spawnSync(process.execPath, [SCRIPT_PATH, sectionPath], {
    cwd: root,
    encoding: 'utf8',
  })
}

test('creates top-level and nested sections with an index at every level', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'cyl-new-section-'))
  try {
    const result = runSection(root, '代码审计/PHP')

    assert.equal(result.status, 0, result.stderr)
    assert.match(
      await readFile(path.join(root, 'content', 'blog', '代码审计', '_index.md'), 'utf8'),
      /title: "代码审计"/
    )
    assert.match(
      await readFile(path.join(root, 'content', 'blog', '代码审计', 'PHP', '_index.md'), 'utf8'),
      /title: "PHP"/
    )
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('accepts Windows separators and preserves an existing section index', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'cyl-new-section-'))
  try {
    const directory = path.join(root, 'content', 'blog', '渗透测试')
    const indexPath = path.join(directory, '_index.md')
    await mkdir(directory, { recursive: true })
    await writeFile(indexPath, '---\ntitle: "自定义标题"\n---\n', 'utf8')

    const result = runSection(root, '渗透测试\\TryHackMe')

    assert.equal(result.status, 0, result.stderr)
    assert.equal(await readFile(indexPath, 'utf8'), '---\ntitle: "自定义标题"\n---\n')
    assert.match(
      await readFile(path.join(directory, 'TryHackMe', '_index.md'), 'utf8'),
      /title: "TryHackMe"/
    )
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('rejects empty, absolute, and traversal section paths', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'cyl-new-section-'))
  try {
    for (const unsafePath of ['', '..', 'ctf/../private', 'C:\\private']) {
      const result = runSection(root, unsafePath)
      assert.notEqual(result.status, 0, `expected ${JSON.stringify(unsafePath)} to fail`)
      assert.match(result.stderr, /系列路径/)
    }
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})
