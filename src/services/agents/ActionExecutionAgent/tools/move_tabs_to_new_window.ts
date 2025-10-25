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

export const moveTabsToNewWindowTool: Tool = {
  name: 'move_tabs_to_new_window',
  description: 'Move selected or matching tabs to a new window.',
  inputSchema: '{ "query?": { "domain?": string, "titleContains?": string }, "tabIds?": number[] }',
  async execute(input: unknown): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { query, tabIds } = typeof input === 'object' && input ? (input as any) : {}
    try {
      let ids: number[] = Array.isArray(tabIds) ? tabIds.filter((n: unknown) => typeof n === 'number') : []
      if (!ids.length) {
        const tabs = await chrome.tabs.query({})
        const domain = query?.domain?.toString().trim()
        const titleContains = query?.titleContains?.toString().toLowerCase().trim()
        ids = tabs
          .filter(t => {
            const okDomain = domain ? hostMatches(t.url, domain) : true
            const okTitle = titleContains ? (t.title || '').toLowerCase().includes(titleContains) : true
            return okDomain && okTitle
          })
          .map(t => t.id!)
          .filter(Boolean) as number[]
      }
      if (!ids.length) return 'No tabs match criteria to move.'

      const first = ids[0]
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const created: any = await chrome.windows.create({ tabId: first })
      const windowId = created?.id as number | undefined
      if (!windowId) return 'Failed to create new window.'
      const rest = ids.slice(1)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (rest.length) await chrome.tabs.move(rest as any, { windowId, index: -1 })
      return `Moved ${ids.length} tab(s) to new window #${windowId}.`
    } catch (e) {
      return `Failed to move tabs. Ensure "tabs" permission is granted. Error: ${e}`
    }
  }
}
