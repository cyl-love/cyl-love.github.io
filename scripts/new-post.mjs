import { mkdir, open, readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { serializeFrontMatter } from './lib/front-matter.mjs'

const DATE_FORMATTER = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Shanghai',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
})

function dateParts(date) {
  return Object.fromEntries(
    DATE_FORMATTER.formatToParts(date)
      .filter(({ type }) => type !== 'literal')
      .map(({ type, value }) => [type, value])
  )
}

function formatDate(date) {
  const value = dateParts(date)
  return `${value.year}-${value.month}-${value.day} ${value.hour}:${value.minute}:${value.second}`
}

function timestampId(date) {
  return formatDate(date).replaceAll(/[- :]/g, '')
}

function safePathSegment(value, fallback) {
  const result = String(value)
    .trim()
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/[. -]+$/g, '')
  return result || fallback
}

async function markdownFiles(directory) {
  const files = []
  let entries
  try {
    entries = await readdir(directory, { withFileTypes: true })
  } catch (error) {
    if (error.code === 'ENOENT') return files
    throw error
  }

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...await markdownFiles(entryPath))
    else if (entry.isFile() && entry.name.endsWith('.md')) files.push(entryPath)
  }
  return files
}

async function existingIds(contentRoot) {
  const ids = new Set()
  for (const filePath of await markdownFiles(contentRoot)) {
    const source = await readFile(filePath, 'utf8')
    const match = source.match(/^abbrlink:\s*["']?(\d+)["']?\s*$/m)
    if (match) ids.add(match[1])
  }
  return ids
}

async function availableFilePath(directory, title) {
  const baseName = safePathSegment(title, 'post')
  for (let suffix = 1; ; suffix += 1) {
    const name = suffix === 1 ? `${baseName}.md` : `${baseName}-${suffix}.md`
    const filePath = path.join(directory, name)
    try {
      const handle = await open(filePath, 'wx')
      return { filePath, handle }
    } catch (error) {
      if (error.code !== 'EEXIST') throw error
    }
  }
}

export async function createPost({
  root = process.cwd(),
  title,
  category = '未分类',
  tags = [],
  now = new Date(),
}) {
  const normalizedTitle = String(title ?? '').trim()
  if (!normalizedTitle) throw new Error('文章标题不能为空')

  const normalizedCategory = String(category || '未分类').trim() || '未分类'
  const normalizedTags = [...new Set(tags.map((tag) => String(tag).trim()).filter(Boolean))]
  const contentRoot = path.join(root, 'content', 'blog')
  const ids = await existingIds(contentRoot)
  let id = BigInt(timestampId(now))
  while (ids.has(String(id))) id += 1n

  const directory = path.join(contentRoot, safePathSegment(normalizedCategory, '未分类'))
  await mkdir(directory, { recursive: true })
  const { filePath, handle } = await availableFilePath(directory, normalizedTitle)
  const identifier = String(id)
  const markdown = serializeFrontMatter(
    {
      title: normalizedTitle,
      date: formatDate(now),
      tags: normalizedTags,
      categories: [normalizedCategory],
      url: `/posts/${identifier}.html`,
      abbrlink: identifier,
      draft: true,
    },
    '在这里开始写正文。\n'
  )

  try {
    await handle.writeFile(markdown, 'utf8')
  } finally {
    await handle.close()
  }

  return { filePath, id: identifier }
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : ''
if (invokedPath === fileURLToPath(import.meta.url)) {
  const [title, category = '未分类', rawTags = ''] = process.argv.slice(2)
  try {
    const result = await createPost({
      title,
      category,
      tags: rawTags.split(/[,，]/),
    })
    console.log(`已创建：${path.relative(process.cwd(), result.filePath)}`)
    console.log('写完后将 front matter 中的 draft 改为 false 即可发布。')
  } catch (error) {
    console.error(`创建文章失败：${error.message}`)
    process.exitCode = 1
  }
}
