import type { Tool } from '../types'
import { getAllActivities } from '../../../dexie/collections/activity'

export const reloadStaleTabsTool: Tool = {
  name: 'reload_stale_tabs',
  description: 'Reload tabs whose last activity is older than N minutes.',
  inputSchema: '{ "ageMinutes": number }',
  async execute(input: unknown): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { ageMinutes } = typeof input === 'object' && input ? (input as any) : {}
    const mins = Number(ageMinutes)
    if (!mins || mins <= 0) return 'Invalid input: ageMinutes > 0 is required.'
    const cutoff = Date.now() - mins * 60_000
    try {
      const activities = await getAllActivities()
      const lastByTab = new Map<number, number>()
      for (const a of activities) lastByTab.set(a.tabId, a.lastActivityTime || a.updatedAt || a.createdAt)

      const tabs = await chrome.tabs.query({})
      let count = 0
      for (const t of tabs) {
        if (!t.id) continue
        const last = lastByTab.get(t.id) ?? 0
        if (last && last < cutoff) {
          await chrome.tabs.reload(t.id, { bypassCache: false })
          count++
        }
      }
      return count ? `Reloaded ${count} stale tab(s) (> ${mins}m).` : `No stale tabs older than ${mins}m.`
    } catch (e) {
      return `Failed to reload stale tabs. Ensure "tabs" permission is granted. Error: ${e}`
    }
  }
}
