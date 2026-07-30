export function safePathSegment(value, fallback = 'uncategorized') {
  const sanitized = String(value ?? '')
    .normalize('NFC')
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[.\s-]+|[.\s-]+$/g, '')

  return sanitized || fallback
}

