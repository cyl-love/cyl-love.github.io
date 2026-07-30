import { cp, mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { parseFrontMatter, serializeFrontMatter } from './lib/front-matter.mjs'
import { safePathSegment } from './lib/slug.mjs'

function asArray(value, fallback = []) {
  if (Array.isArray(value)) return value.map(String).filter(Boolean)
  if (value === undefined || value === null || value === '') return fallback
  return [String(value)]
}

function rewriteImagePaths(body) {
  return body
    .replace(/(\]\()\.\.\/images\//g, '$1/images/')
    .replace(/((?:src|href)=["'])\.\.\/images\//gi, '$1/images/')
}

export function convertPost(markdown, sourceName) {
  const { data: rawData, body: rawBody } = parseFrontMatter(markdown)
  const abbrlink = String(rawData.abbrlink ?? '').trim()

  if (!rawData.title) throw new Error(`Missing title: ${sourceName}`)
  if (!rawData.date) throw new Error(`Missing date: ${sourceName}`)
  if (!abbrlink) throw new Error(`Missing abbrlink: ${sourceName}`)

  const categories = asArray(rawData.categories, ['未分类'])
  const tags = asArray(rawData.tags)
  const data = {
    ...rawData,
    title: String(rawData.title),
    date: String(rawData.date),
    tags,
    categories,
    abbrlink,
    url: `/posts/${abbrlink}.html`,
  }

  return {
    abbrlink,
    body: rewriteImagePaths(rawBody),
    category: categories[0],
    data,
    sourceName,
  }
}

export function validatePosts(posts) {
  const seen = new Map()

  for (const post of posts) {
    const previous = seen.get(post.abbrlink)
    if (previous) {
      throw new Error(
        `Duplicate abbrlink ${post.abbrlink}: ${previous}, ${post.sourceName}`
      )
    }
    seen.set(post.abbrlink, post.sourceName)
  }
}

export async function migrateSite(rootDirectory = process.cwd()) {
  const sourcePosts = path.join(rootDirectory, 'source', '_posts')
  const sourceImages = path.join(rootDirectory, 'source', 'images')
  const contentRoot = path.join(rootDirectory, 'content', 'blog')
  const staticImages = path.join(rootDirectory, 'static', 'images')
  const sourceNames = (await readdir(sourcePosts))
    .filter((name) => name.toLowerCase().endsWith('.md'))
    .sort((a, b) => a.localeCompare(b, 'zh-CN'))

  const posts = []
  for (const sourceName of sourceNames) {
    const markdown = await readFile(path.join(sourcePosts, sourceName), 'utf8')
    posts.push(convertPost(markdown, sourceName))
  }
  validatePosts(posts)

  const categories = new Set()
  for (const post of posts) {
    const categoryDirectory = safePathSegment(post.category, '未分类')
    const outputDirectory = path.join(contentRoot, categoryDirectory)
    const outputName = safePathSegment(path.parse(post.sourceName).name, post.abbrlink)
    categories.add(JSON.stringify([categoryDirectory, post.category]))
    await mkdir(outputDirectory, { recursive: true })
    await writeFile(
      path.join(outputDirectory, `${outputName}.md`),
      serializeFrontMatter(post.data, post.body),
      'utf8'
    )
  }

  for (const encoded of categories) {
    const [directory, title] = JSON.parse(encoded)
    await writeFile(
      path.join(contentRoot, directory, '_index.md'),
      serializeFrontMatter({ title }, ''),
      'utf8'
    )
  }

  await mkdir(staticImages, { recursive: true })
  await cp(sourceImages, staticImages, { recursive: true, force: true })

  return { categories: categories.size, posts: posts.length }
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : ''
if (invokedPath === fileURLToPath(import.meta.url)) {
  const result = await migrateSite()
  console.log(`Migrated ${result.posts} posts across ${result.categories} categories.`)
}

