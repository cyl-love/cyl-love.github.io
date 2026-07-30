import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  Check,
  Clock3,
  Copy,
  Home,
  Moon,
  Search,
  Sun,
  Tags,
  X,
  createIcons,
} from 'lucide'

import {
  filterSearchItems,
  normalizePath,
  resolveInitialTheme,
} from './site-utils.mjs'

const iconSet = {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  Check,
  Clock3,
  Copy,
  Home,
  Moon,
  Search,
  Sun,
  Tags,
  X,
}

const root = document.documentElement

function applyTheme(theme) {
  root.dataset.theme = theme
  const toggle = document.querySelector('[data-theme-toggle]')
  toggle?.setAttribute('aria-checked', String(theme === 'dark'))
  document.querySelector('meta[name="theme-color"]')?.setAttribute(
    'content',
    theme === 'dark' ? '#171a19' : '#f7f8f8'
  )
}

function initializeTheme() {
  let savedTheme = null
  try {
    savedTheme = localStorage.getItem('cyl-theme')
  } catch (_) {
    savedTheme = null
  }
  const theme = resolveInitialTheme(
    savedTheme,
    window.matchMedia('(prefers-color-scheme: dark)').matches
  )
  applyTheme(theme)

  document.querySelector('[data-theme-toggle]')?.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark'
    applyTheme(next)
    try {
      localStorage.setItem('cyl-theme', next)
    } catch (_) {
      // The selected theme still applies for the current page.
    }
  })
}

function initializeTree() {
  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-tree-toggle]')
    if (!button) return

    const target = document.getElementById(button.getAttribute('aria-controls'))
    if (!target) return

    const willExpand = button.getAttribute('aria-expanded') !== 'true'
    button.setAttribute('aria-expanded', String(willExpand))
    target.hidden = !willExpand
  })

  document.querySelectorAll('.sidebar-tree .is-active').forEach((active) => {
    let branch = active.closest('.tree-children')
    while (branch) {
      branch.hidden = false
      const button = document.querySelector(`[aria-controls="${branch.id}"]`)
      button?.setAttribute('aria-expanded', 'true')
      branch = branch.parentElement?.closest('.tree-children')
    }
  })
}

function initializeCodeBlocks() {
  const announcement = document.createElement('div')
  announcement.className = 'sr-only'
  announcement.setAttribute('aria-live', 'polite')
  document.body.append(announcement)

  document.querySelectorAll('pre').forEach((pre) => {
    let container = pre.closest('.highlight')
    if (!container) {
      container = document.createElement('div')
      pre.before(container)
      container.append(pre)
    }
    if (container.classList.contains('code-block')) return

    container.classList.add('code-block')
    const button = document.createElement('button')
    button.className = 'copy-button icon-button'
    button.type = 'button'
    button.title = '复制代码'
    button.setAttribute('aria-label', '复制代码')
    button.innerHTML = '<i data-lucide="copy" aria-hidden="true"></i>'
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(pre.innerText)
        button.innerHTML = '<i data-lucide="check" aria-hidden="true"></i>'
        button.classList.add('is-copied')
        button.setAttribute('aria-label', '已复制')
        announcement.textContent = '代码已复制'
        createIcons({ icons: iconSet })
        window.setTimeout(() => {
          button.innerHTML = '<i data-lucide="copy" aria-hidden="true"></i>'
          button.classList.remove('is-copied')
          button.setAttribute('aria-label', '复制代码')
          createIcons({ icons: iconSet })
        }, 1600)
      } catch (_) {
        announcement.textContent = '复制失败，请手动选择代码'
      }
    })
    container.append(button)
  })
}

function initializeSearch() {
  const dialog = document.getElementById('search-dialog')
  const input = document.getElementById('search-input')
  const results = document.getElementById('search-results')
  const status = document.getElementById('search-status')
  if (!dialog || !input || !results || !status) return

  let index = null
  let selected = -1

  const loadIndex = async () => {
    if (index) return index
    status.textContent = '正在载入搜索索引…'
    const response = await fetch('/index.json', { cache: 'force-cache' })
    if (!response.ok) throw new Error(`Search index returned ${response.status}`)
    index = await response.json()
    status.textContent = `已载入 ${index.length} 篇文章`
    return index
  }

  const selectResult = (next) => {
    const links = [...results.querySelectorAll('a')]
    if (!links.length) {
      selected = -1
      return
    }
    selected = (next + links.length) % links.length
    links.forEach((link, indexValue) => {
      link.classList.toggle('is-selected', indexValue === selected)
      link.setAttribute('aria-selected', String(indexValue === selected))
    })
    links[selected].scrollIntoView({ block: 'nearest' })
  }

  const render = (items, query) => {
    results.replaceChildren()
    selected = -1
    status.textContent = items.length
      ? `找到 ${items.length} 条与“${query}”相关的结果`
      : `没有找到与“${query}”相关的文章`

    items.forEach((item) => {
      const link = document.createElement('a')
      link.href = item.link
      link.className = 'search-result'
      link.setAttribute('role', 'option')
      link.setAttribute('aria-selected', 'false')

      const title = document.createElement('strong')
      title.textContent = item.title
      const excerpt = document.createElement('span')
      excerpt.textContent = item.summary || item.content.slice(0, 120)
      const meta = document.createElement('small')
      meta.textContent = [item.categories?.[0], item.date].filter(Boolean).join(' / ')
      link.append(title, excerpt, meta)
      results.append(link)
    })
  }

  const open = async () => {
    if (!dialog.open) dialog.showModal()
    input.focus()
    try {
      await loadIndex()
      if (input.value.trim()) input.dispatchEvent(new Event('input'))
    } catch (_) {
      status.textContent = '搜索索引载入失败，请稍后重试'
    }
  }

  document.querySelectorAll('[data-search-open]').forEach((button) => {
    button.addEventListener('click', open)
  })
  document.querySelector('[data-search-close]')?.addEventListener('click', () => dialog.close())
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close()
  })
  document.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLocaleLowerCase() === 'k') {
      event.preventDefault()
      open()
    }
  })
  input.addEventListener('input', () => {
    const query = input.value.trim()
    if (!query || !index) {
      results.replaceChildren()
      status.textContent = query ? '正在载入搜索索引…' : '输入关键词开始搜索'
      return
    }
    render(filterSearchItems(index, query), query)
  })
  input.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      selectResult(selected + 1)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      selectResult(selected - 1)
    } else if (event.key === 'Enter' && selected >= 0) {
      event.preventDefault()
      results.querySelectorAll('a')[selected]?.click()
    }
  })
}

function initializeToc() {
  const tocLinks = [...document.querySelectorAll('[data-toc] a')]
  if (!tocLinks.length) return

  const linksById = new Map(
    tocLinks.map((link) => [decodeURIComponent(link.hash.slice(1)), link])
  )
  const headings = [...document.querySelectorAll('.markdown-body h2[id], .markdown-body h3[id], .markdown-body h4[id]')]
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries.find((entry) => entry.isIntersecting)
      if (!visible) return
      tocLinks.forEach((link) => link.classList.remove('is-active'))
      linksById.get(visible.target.id)?.classList.add('is-active')
    },
    { rootMargin: '-72px 0px -72% 0px', threshold: 0 }
  )
  headings.forEach((heading) => observer.observe(heading))
}

function initializeHoverPreview() {
  if (window.matchMedia('(hover: none)').matches) return
  const preview = document.createElement('div')
  preview.className = 'article-preview'
  document.body.append(preview)

  document.querySelectorAll('.homepage-tree .tree-article-link').forEach((link) => {
    link.addEventListener('pointerenter', (event) => {
      const summary = link.dataset.summary?.trim()
      if (!summary) return
      preview.textContent = summary.slice(0, 220)
      preview.classList.add('is-visible')
      const width = Math.min(420, window.innerWidth - 32)
      const left = Math.min(event.clientX + 16, window.innerWidth - width - 16)
      const top = Math.min(event.clientY + 18, window.innerHeight - 150)
      preview.style.setProperty('--preview-left', `${Math.max(16, left)}px`)
      preview.style.setProperty('--preview-top', `${Math.max(16, top)}px`)
    })
    link.addEventListener('pointerleave', () => preview.classList.remove('is-visible'))
  })
}

function markActiveFallback() {
  const current = normalizePath(window.location.pathname)
  document.querySelectorAll('.sidebar-tree a[href]').forEach((link) => {
    if (normalizePath(new URL(link.href).pathname) === current) {
      link.closest('.tree-article')?.classList.add('is-active')
    }
  })
}

initializeTheme()
initializeCodeBlocks()
createIcons({ icons: iconSet })
initializeTree()
initializeSearch()
initializeToc()
initializeHoverPreview()
markActiveFallback()

