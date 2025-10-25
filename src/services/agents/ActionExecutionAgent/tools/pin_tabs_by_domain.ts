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

export const pinTabsByDomainTool: Tool = {
  name: 'pin_tabs_by_domain',
  description: 'Pin all tabs that match a given domain (hostname).',
  inputSchema: '{ "domain": string }',
  async execute(input: unknown): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { domain } = typeof input === 'object' && input ? (input as any) : {}
    const d = (domain || '').toString().trim()
    if (!d) return 'Invalid input: domain is required.'
    try {
      const tabs = await chrome.tabs.query({})
      let count = 0
      for (const t of tabs) {
        if (t.id && hostMatches(t.url, d) && !t.pinned) {
          await chrome.tabs.update(t.id, { pinned: true })
          count++
        }
      }
      return count ? `Pinned ${count} tab(s) for domain "${d}".` : `No tabs to pin for domain "${d}".`
    } catch (e) {
      return `Failed to pin tabs. Ensure "tabs" permission is granted. Error: ${e}`
    }
  }
}
