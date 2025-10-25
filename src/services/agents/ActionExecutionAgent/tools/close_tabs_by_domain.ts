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

export const closeTabsByDomainTool: Tool = {
  name: 'close_tabs_by_domain',
  description: 'Close all tabs whose hostname matches the given domain.',
  inputSchema: '{ "domain": string, "windowScope?": "current"|"all" }',
  async execute(input: unknown): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { domain, windowScope } = typeof input === 'object' && input ? (input as any) : {}
    const d = (domain || '').toString().trim()
    if (!d) return 'Invalid input: domain is required.'
    try {
      const query: chrome.tabs.QueryInfo = windowScope === 'current' ? { currentWindow: true } : {}
      const tabs = await chrome.tabs.query(query)
      const toClose = tabs
        .filter(t => hostMatches(t.url, d))
        .map(t => t.id!)
        .filter(Boolean) as number[]
      if (toClose.length === 0) return `No tabs found for domain "${d}".`
      await chrome.tabs.remove(toClose)
      return `Closed ${toClose.length} tab(s) for domain "${d}".`
    } catch (e) {
      return `Failed to close tabs. Ensure "tabs" permission is granted. Error: ${e}`
    }
  }
}
