import type { Tool } from '../types'

function getHost(url?: string | null): string | null {
  if (!url) return null
  try {
    return new URL(url).hostname
  } catch {
    return null
  }
}

const COLORS: chrome.tabGroups.Color[] = [
  chrome.tabGroups.Color.BLUE,
  chrome.tabGroups.Color.RED,
  chrome.tabGroups.Color.YELLOW,
  chrome.tabGroups.Color.GREEN,
  chrome.tabGroups.Color.PINK,
  chrome.tabGroups.Color.PURPLE,
  chrome.tabGroups.Color.CYAN,
  chrome.tabGroups.Color.GREY
]

export const groupTabsByDomainTool: Tool = {
  name: 'group_tabs_by_domain',
  description: 'Group tabs by domain in a window and optionally collapse groups.',
  inputSchema: '{ "windowId?": number, "collapse?": boolean }',
  async execute(input: unknown): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { windowId, collapse } = typeof input === 'object' && input ? (input as any) : {}
    try {
      const wId = typeof windowId === 'number' ? windowId : (await chrome.windows.getCurrent()).id!
      const tabs = await chrome.tabs.query({ windowId: wId })
      const byHost = new Map<string, number[]>()
      for (const t of tabs) {
        if (!t.id) continue
        const host = getHost(t.url)
        if (!host) continue
        const arr = byHost.get(host) || []
        arr.push(t.id)
        byHost.set(host, arr)
      }
      let grouped = 0
      let idx = 0
      for (const [host, ids] of byHost.entries()) {
        if (ids.length < 2) continue
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const groupId = await (chrome.tabs.group as any)({ tabIds: ids as any, createProperties: { windowId: wId } })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (chrome.tabGroups.update as any)(groupId as number, {
          title: host,
          color: COLORS[idx % COLORS.length],
          collapsed: Boolean(collapse)
        })
        grouped += ids.length
        idx++
      }
      return grouped ? `Grouped ${grouped} tab(s) by domain.` : 'No groups created (need >= 2 tabs per domain).'
    } catch (e) {
      return `Failed to group tabs. Ensure "tabs" and "tabGroups" permissions are granted. Error: ${e}`
    }
  }
}
