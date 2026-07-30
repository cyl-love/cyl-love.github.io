import assert from 'node:assert/strict'
import test from 'node:test'

import { deploy, runCommand } from './deploy.mjs'

function fakeRunner(responses = new Map()) {
  const calls = []
  const run = async (command, args, options = {}) => {
    calls.push([command, args, options])
    const key = `${command} ${args.join(' ')}`
    const response = responses.get(key)
    if (response instanceof Error) throw response
    return response ?? { code: 0, stdout: '', stderr: '' }
  }
  return { calls, run }
}

test('runCommand launches npm through the real Windows process boundary', async () => {
  const result = await runCommand('npm', ['--version'])

  assert.equal(result.code, 0)
  assert.match(result.stdout.trim(), /^\d+\.\d+\.\d+/)
})

test('verifies, commits and pushes the main branch', async () => {
  const { calls, run } = fakeRunner(new Map([
    ['git branch --show-current', { code: 0, stdout: 'main\n', stderr: '' }],
    ['git remote get-url origin', { code: 0, stdout: 'git@github.com:cyl-love/cyl-love.github.io.git\n', stderr: '' }],
    ['git diff --cached --quiet', { code: 1, stdout: '', stderr: '' }],
  ]))

  const result = await deploy({
    run,
    message: 'site: test publish',
    logger: { log() {} },
  })

  assert.equal(result.status, 'pushed')
  assert.deepEqual(
    calls.map(([command, args]) => `${command} ${args.join(' ')}`),
    [
      'git rev-parse --is-inside-work-tree',
      'git branch --show-current',
      'git remote get-url origin',
      'npm run verify',
      'git add -A',
      'git diff --cached --quiet',
      'git diff --cached --stat',
      'git commit -m site: test publish',
      'git push origin main',
    ]
  )
})

test('does not create an empty commit when no tracked content changed', async () => {
  const { calls, run } = fakeRunner(new Map([
    ['git branch --show-current', { code: 0, stdout: 'main\n', stderr: '' }],
    ['git remote get-url origin', { code: 0, stdout: 'origin-url\n', stderr: '' }],
    ['git diff --cached --quiet', { code: 0, stdout: '', stderr: '' }],
  ]))

  const result = await deploy({ run, logger: { log() {} } })

  assert.equal(result.status, 'no-changes')
  assert.equal(calls.some(([command, args]) => command === 'git' && args[0] === 'commit'), false)
  assert.equal(calls.some(([command, args]) => command === 'git' && args[0] === 'push'), false)
})

test('stops when the current branch is not main', async () => {
  const { run } = fakeRunner(new Map([
    ['git branch --show-current', { code: 0, stdout: 'feature\n', stderr: '' }],
  ]))

  await assert.rejects(() => deploy({ run, logger: { log() {} } }), /必须在 main 分支发布/)
})
