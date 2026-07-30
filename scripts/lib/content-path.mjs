import { mkdir, open, readFile } from 'node:fs/promises'
import path from 'node:path'

import { parseFrontMatter, serializeFrontMatter } from './front-matter.mjs'

const WINDOWS_ABSOLUTE_PATH = /^[A-Za-z]:[\\/]/
const WINDOWS_RESERVED_NAME = /^(con|prn|aux|nul|com[1-9]|lpt[1-9]|conin\$|conout\$)(\..*)?$/i

export function isWindowsReservedName(value) {
  return WINDOWS_RESERVED_NAME.test(String(value))
}

function safeDirectoryName(value) {
  const name = value
    .replace(/[<>:"|?*\u0000-\u001f]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/[. ]+$/g, '')

  if (!name || isWindowsReservedName(name)) {
    throw new Error(`系列路径包含无效目录名：${JSON.stringify(value)}`)
  }
  return name
}

export function parseSectionPath(sectionPath) {
  const value = String(sectionPath ?? '').trim()
  if (!value) throw new Error('系列路径不能为空')
  if (path.isAbsolute(value) || WINDOWS_ABSOLUTE_PATH.test(value) || /^[\\/]{2}/.test(value)) {
    throw new Error('系列路径不能是绝对路径')
  }

  const rawSegments = value.replaceAll('\\', '/').split('/')
  if (rawSegments.some((segment) => !segment.trim())) {
    throw new Error('系列路径不能包含空目录名')
  }

  return rawSegments.map((segment) => {
    const title = segment.trim()
    if (title === '.' || title === '..') {
      throw new Error('系列路径不能包含 . 或 ..')
    }
    return { directoryName: safeDirectoryName(title), title }
  })
}

async function createIndexIfMissing(directory, title) {
  const indexPath = path.join(directory, '_index.md')
  let handle
  try {
    handle = await open(indexPath, 'wx')
  } catch (error) {
    if (error.code === 'EEXIST') return false
    throw error
  }

  try {
    await handle.writeFile(`${serializeFrontMatter({ title }, '').trimEnd()}\n`, 'utf8')
  } finally {
    await handle.close()
  }
  return true
}

export async function ensureSection({ root = process.cwd(), sectionPath }) {
  const segments = parseSectionPath(sectionPath)
  let directory = path.join(root, 'content', 'blog')
  const createdIndexes = []
  let leafTitle = ''

  for (const segment of segments) {
    directory = path.join(directory, segment.directoryName)
    await mkdir(directory, { recursive: true })
    const indexPath = path.join(directory, '_index.md')
    if (await createIndexIfMissing(directory, segment.title)) {
      createdIndexes.push(indexPath)
    }

    let parsed
    try {
      parsed = parseFrontMatter(await readFile(indexPath, 'utf8'))
    } catch (error) {
      throw new Error(`系列目录页无效：${indexPath}（${error.message}）`)
    }
    leafTitle = String(parsed.data.title ?? '').trim()
    if (!leafTitle) {
      throw new Error(`系列目录页缺少 title：${indexPath}`)
    }
  }

  return {
    createdIndexes,
    directory,
    leafTitle,
  }
}
