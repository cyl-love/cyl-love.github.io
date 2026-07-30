export function filterSearchItems(items, query, limit = 30) {
  const normalizedQuery = String(query ?? '').trim().toLocaleLowerCase()
  if (!normalizedQuery) return []

  return items
    .filter((item) =>
      [item.title, item.summary, item.content]
        .filter(Boolean)
        .some((value) => String(value).toLocaleLowerCase().includes(normalizedQuery))
    )
    .slice(0, limit)
}

export function resolveInitialTheme(storedTheme, prefersDark) {
  if (storedTheme === 'light' || storedTheme === 'dark') return storedTheme
  return prefersDark ? 'dark' : 'light'
}

export function normalizePath(value) {
  const path = String(value || '/')
  if (path === '/') return path
  return path.replace(/\/+$/, '')
}

