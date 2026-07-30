import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

function executable(command) {
  return process.platform === 'win32' && command === 'npm' ? 'npm.cmd' : command
}

export function runCommand(command, args, { inherit = false } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(executable(command), args, {
      cwd: process.cwd(),
      stdio: inherit ? 'inherit' : ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    })
    let stdout = ''
    let stderr = ''
    if (!inherit) {
      child.stdout.on('data', (chunk) => { stdout += chunk })
      child.stderr.on('data', (chunk) => { stderr += chunk })
    }
    child.on('error', reject)
    child.on('close', (code) => resolve({ code: code ?? 1, stdout, stderr }))
  })
}

function requireSuccess(result, description) {
  if (result.code !== 0) {
    const detail = result.stderr?.trim() || result.stdout?.trim()
    throw new Error(`${description}失败${detail ? `：${detail}` : ''}`)
  }
}

function defaultMessage(now) {
  const stamp = new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    dateStyle: 'short',
    timeStyle: 'medium',
    hourCycle: 'h23',
  }).format(now)
  return `site: update ${stamp}`
}

export async function deploy({
  run = runCommand,
  message = defaultMessage(new Date()),
  logger = console,
} = {}) {
  const repository = await run('git', ['rev-parse', '--is-inside-work-tree'])
  requireSuccess(repository, 'Git 仓库检查')

  const branch = await run('git', ['branch', '--show-current'])
  requireSuccess(branch, 'Git 分支检查')
  if (branch.stdout.trim() !== 'main') {
    throw new Error(`必须在 main 分支发布，当前分支是 ${branch.stdout.trim() || '(detached HEAD)'}`)
  }

  const remote = await run('git', ['remote', 'get-url', 'origin'])
  requireSuccess(remote, 'origin 远程仓库检查')

  logger.log('1/4 正在运行完整验证...')
  const verification = await run('npm', ['run', 'verify'], { inherit: true })
  requireSuccess(verification, '站点验证')

  logger.log('2/4 正在整理待提交文件...')
  const add = await run('git', ['add', '-A'], { inherit: true })
  requireSuccess(add, 'Git 暂存')

  const diff = await run('git', ['diff', '--cached', '--quiet'])
  if (diff.code === 0) {
    logger.log('没有需要发布的源码变更。')
    return { status: 'no-changes' }
  }
  if (diff.code !== 1) requireSuccess(diff, 'Git 变更检查')

  const summary = await run('git', ['diff', '--cached', '--stat'])
  requireSuccess(summary, 'Git 变更摘要')
  if (summary.stdout.trim()) logger.log(summary.stdout.trim())

  logger.log('3/4 正在提交源码...')
  const commit = await run('git', ['commit', '-m', message], { inherit: true })
  requireSuccess(commit, 'Git 提交')

  logger.log('4/4 正在推送 main，随后由 GitHub Actions 发布...')
  const push = await run('git', ['push', 'origin', 'main'], { inherit: true })
  requireSuccess(push, 'Git 推送')
  logger.log('推送完成。请在 GitHub Actions 中查看部署状态。')
  return { status: 'pushed' }
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : ''
if (invokedPath === fileURLToPath(import.meta.url)) {
  const message = process.argv.slice(2).join(' ').trim() || undefined
  try {
    await deploy({ message })
  } catch (error) {
    console.error(`发布失败：${error.message}`)
    process.exitCode = 1
  }
}
