const FRONT_MATTER_BOUNDARY = /^---\s*$/m

function parseScalar(value) {
  const trimmed = value.trim()

  if (!trimmed) return ''
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1)
  }

  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    return trimmed
      .slice(1, -1)
      .split(',')
      .map((item) => parseScalar(item))
      .filter(Boolean)
  }

  return trimmed
}

export function parseFrontMatter(markdown) {
  const normalized = markdown.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n')
  const lines = normalized.split('\n')

  if (!FRONT_MATTER_BOUNDARY.test(lines[0] ?? '')) {
    throw new Error('Markdown does not start with YAML front matter')
  }

  const end = lines.indexOf('---', 1)
  if (end === -1) throw new Error('YAML front matter is not closed')

  const data = {}
  let activeList = null

  for (const line of lines.slice(1, end)) {
    const listMatch = line.match(/^\s*-\s+(.+)$/)
    if (activeList && listMatch) {
      data[activeList].push(parseScalar(listMatch[1]))
      continue
    }

    const fieldMatch = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/)
    if (!fieldMatch) continue

    const [, key, rawValue] = fieldMatch
    if (rawValue.trim()) {
      data[key] = parseScalar(rawValue)
      activeList = null
    } else {
      data[key] = []
      activeList = key
    }
  }

  return {
    data,
    body: lines.slice(end + 1).join('\n').replace(/^\n+/, ''),
  }
}

function yamlValue(value) {
  if (Array.isArray(value)) return JSON.stringify(value)
  if (typeof value === 'boolean' || typeof value === 'number') return String(value)
  return JSON.stringify(String(value))
}

export function serializeFrontMatter(data, body) {
  const preferredOrder = [
    'title',
    'date',
    'lastmod',
    'tags',
    'categories',
    'url',
    'abbrlink',
    'description',
    'draft',
  ]
  const keys = [
    ...preferredOrder.filter((key) => key in data),
    ...Object.keys(data).filter((key) => !preferredOrder.includes(key)),
  ]
  const fields = keys.map((key) => `${key}: ${yamlValue(data[key])}`)

  return `---\n${fields.join('\n')}\n---\n\n${body.replace(/^\n+/, '')}`
}

