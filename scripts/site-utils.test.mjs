import assert from 'node:assert/strict'
import test from 'node:test'

import {
  filterSearchItems,
  normalizePath,
  resolveInitialTheme,
} from '../assets/js/site-utils.mjs'

const items = [
  {
    title: 'JS 逆向基础',
    summary: '浏览器调试记录',
    content: '学习 JavaScript 加密与签名',
  },
  {
    title: '应急响应复盘',
    summary: '内存取证',
    content: 'Volatility 分析流程',
  },
  {
    title: 'CTF Web',
    summary: '比赛记录',
    content: 'JavaScript 沙箱题目',
  },
]

test('filters search items across title, summary, and content', () => {
  assert.deepEqual(
    filterSearchItems(items, 'javascript').map((item) => item.title),
    ['JS 逆向基础', 'CTF Web']
  )
  assert.deepEqual(
    filterSearchItems(items, '内存取证').map((item) => item.title),
    ['应急响应复盘']
  )
})

test('caps rendered search results', () => {
  assert.equal(filterSearchItems(items, 'a', 1).length, 1)
})

test('prefers a stored theme and otherwise follows the system', () => {
  assert.equal(resolveInitialTheme('light', true), 'light')
  assert.equal(resolveInitialTheme(null, true), 'dark')
  assert.equal(resolveInitialTheme(null, false), 'light')
})

test('normalizes paths for active navigation comparisons', () => {
  assert.equal(normalizePath('/posts/123.html/'), '/posts/123.html')
  assert.equal(normalizePath('/'), '/')
})

