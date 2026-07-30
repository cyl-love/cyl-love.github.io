import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { ensureSection } from './lib/content-path.mjs'

export async function createSection(options) {
  return ensureSection(options)
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : ''
if (invokedPath === fileURLToPath(import.meta.url)) {
  const [sectionPath] = process.argv.slice(2)
  try {
    const result = await createSection({ sectionPath })
    console.log(`系列目录已就绪：${path.relative(process.cwd(), result.directory)}`)
    if (result.createdIndexes.length) {
      console.log(`新建目录页：${result.createdIndexes.length} 个`)
    }
  } catch (error) {
    console.error(`创建系列失败：${error.message}`)
    process.exitCode = 1
  }
}
