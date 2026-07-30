import { access, readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { parseFrontMatter } from './lib/front-matter.mjs'

async function exists(filePath) {
  try {
    await access(filePath)
    return true
  } catch (_) {
    return false
  }
}

async function walkMarkdown(directory) {
  const files = []
  if (!(await exists(directory))) return files

  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...await walkMarkdown(entryPath))
    else if (entry.isFile() && entry.name.endsWith('.md') && entry.name !== '_index.md') {
      files.push(entryPath)
    }
  }
  return files.sort()
}

function cleanLocalUrl(value) {
  const withoutSuffix = value.split(/[?#]/, 1)[0]
  try {
    return decodeURIComponent(withoutSuffix)
  } catch (_) {
    return withoutSuffix
  }
}

export function collectImageReferences(markdown) {
  const references = new Set()
  const htmlImage = /<img\b[^>]*\bsrc=["'](\/images\/[^"']+)["'][^>]*>/gi

  let cursor = 0
  while (cursor < markdown.length) {
    const destinationStart = markdown.indexOf('](', cursor)
    if (destinationStart === -1) break

    const imageStart = markdown.lastIndexOf('![', destinationStart)
    if (imageStart === -1 || markdown.indexOf('](', imageStart) !== destinationStart) {
      cursor = destinationStart + 2
      continue
    }

    let index = destinationStart + 2
    let depth = 0
    let destinationEnd = -1
    for (; index < markdown.length; index += 1) {
      const character = markdown[index]
      if (character === '(') depth += 1
      else if (character === ')' && depth > 0) depth -= 1
      else if (character === ')' && depth === 0) {
        destinationEnd = index
        break
      }
    }

    if (destinationEnd !== -1) {
      const destination = markdown.slice(destinationStart + 2, destinationEnd).trim()
      if (destination.startsWith('/images/')) {
        references.add(cleanLocalUrl(destination.replace(/^<|>$/g, '')))
      }
      cursor = destinationEnd + 1
    } else {
      break
    }
  }
  for (const match of markdown.matchAll(htmlImage)) {
    references.add(cleanLocalUrl(match[1].trim()))
  }

  return [...references].sort()
}

function publicPathForRoute(rootDirectory, route) {
  const relative = route.replace(/^\/+/, '')
  return path.join(rootDirectory, 'public', ...relative.split('/'))
}

export async function verifySite(rootDirectory = process.cwd()) {
  const contentRoot = path.join(rootDirectory, 'content', 'blog')
  const contentFiles = await walkMarkdown(contentRoot)
  const errors = []
  const allRoutes = new Map()
  const publishedRoutes = new Map()
  let imageReferences = 0
  let drafts = 0
  let posts = 0

  for (const filePath of contentFiles) {
    const sourceLabel = path.relative(rootDirectory, filePath).replaceAll('\\', '/')
    const markdown = await readFile(filePath, 'utf8')
    let parsed
    try {
      parsed = parseFrontMatter(markdown)
    } catch (error) {
      errors.push(`${sourceLabel}: ${error.message}`)
      continue
    }

    const { data } = parsed
    const isDraft = data.draft === true || String(data.draft).toLowerCase() === 'true'
    if (isDraft) drafts += 1
    else posts += 1
    if (!data.title) errors.push(`${sourceLabel}: missing title`)
    if (!data.date) errors.push(`${sourceLabel}: missing date`)
    if (!data.url) errors.push(`${sourceLabel}: missing legacy url`)

    if (data.url) {
      const prior = allRoutes.get(data.url)
      if (prior) errors.push(`${sourceLabel}: duplicate route ${data.url} already used by ${prior}`)
      else allRoutes.set(data.url, sourceLabel)

      if (!isDraft) publishedRoutes.set(data.url, sourceLabel)
      if (!isDraft && !(await exists(publicPathForRoute(rootDirectory, data.url)))) {
        errors.push(`${sourceLabel}: missing generated route ${data.url}`)
      }
    }

    for (const imageUrl of collectImageReferences(parsed.body)) {
      imageReferences += 1
      const imagePath = path.join(
        rootDirectory,
        'static',
        ...imageUrl.replace(/^\/images\//, 'images/').split('/')
      )
      if (!(await exists(imagePath))) errors.push(`${sourceLabel}: missing image ${imageUrl}`)
    }
  }

  for (const required of [
    'public/index.html',
    'public/index.json',
    'public/about/index.html',
    'public/link/index.html',
    'public/404.html',
  ]) {
    if (!(await exists(path.join(rootDirectory, ...required.split('/'))))) {
      errors.push(`${required}: required generated file is missing`)
    }
  }

  let searchEntries = 0
  const searchPath = path.join(rootDirectory, 'public', 'index.json')
  if (await exists(searchPath)) {
    try {
      const index = JSON.parse(await readFile(searchPath, 'utf8'))
      searchEntries = index.length
      if (!Array.isArray(index)) errors.push('public/index.json: search index is not an array')
      else if (index.length !== posts) {
        errors.push(
          `public/index.json: expected ${posts} entries, found ${index.length}`
        )
      }
    } catch (error) {
      errors.push(`public/index.json: invalid JSON (${error.message})`)
    }
  }

  if (errors.length) {
    throw new Error(`Site verification failed:\n- ${errors.join('\n- ')}`)
  }

  return {
    drafts,
    imageReferences,
    legacyRoutes: publishedRoutes.size,
    posts,
    searchEntries,
  }
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : ''
if (invokedPath === fileURLToPath(import.meta.url)) {
  const result = await verifySite()
  console.log(
    `Verified ${result.posts} posts, ${result.legacyRoutes} legacy routes, ` +
    `${result.searchEntries} search entries, ${result.drafts} drafts, and ` +
    `${result.imageReferences} local image references.`
  )
}
