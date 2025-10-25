import type { Tool } from '../types'

function hostMatches(url: string | undefined, domain: string): boolean {
  if (!url) return false
  try {
    const h = new URL(url).hostname
    return h === domain || h.endsWith(`.${domain}`)
  } catch {
    return false
  }
}

export const highlightTabsByQueryTool: Tool = {
  name: 'highlight_tabs_by_query',
  description: 'Highlight tabs in the current window by domain/title/url filters.',
  inputSchema: '{ "domain?": string, "titleContains?": string, "urlContains?": string }',
  async execute(input: unknown): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { domain, titleContains, urlContains } = typeof input === 'object' && input ? (input as any) : {}
    try {
      const win = await chrome.windows.getCurrent()
      const tabs = await chrome.tabs.query({ windowId: win.id })
      const titleNeedle = titleContains ? String(titleContains).toLowerCase() : ''
      const urlNeedle = urlContains ? String(urlContains).toLowerCase() : ''
      const indices = tabs
        .map((t, i) => ({ t, i }))
        .filter(({ t }) => {
          const okDomain = domain ? hostMatches(t.url, domain) : true
          const okTitle = titleNeedle ? (t.title || '').toLowerCase().includes(titleNeedle) : true
          const okUrl = urlNeedle ? (t.url || '').toLowerCase().includes(urlNeedle) : true
          return okDomain && okTitle && okUrl
        })
        .map(({ i }) => i)
      if (!indices.length) return 'No tabs match filters to highlight.'
      await chrome.tabs.highlight({ windowId: win.id!, tabs: indices })
      return `Highlighted ${indices.length} tab(s) in window #${win.id}.`
    } catch (e) {
      return `Failed to highlight tabs. Ensure "tabs" permission is granted. Error: ${e}`
    }
  }
}
