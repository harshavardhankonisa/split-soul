import type { Tool } from '../types'
import { getAllActivities } from '../../../dexie/collections/activity'

export const discardInactiveTabsTool: Tool = {
  name: 'discard_inactive_tabs',
  description: 'Discard (free memory) for tabs inactive for N minutes; they stay open but are unloaded.',
  inputSchema: '{ "idleMinutes": number, "keepPinned?": boolean }',
  async execute(input: unknown): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { idleMinutes, keepPinned } = typeof input === 'object' && input ? (input as any) : {}
    const mins = Number(idleMinutes)
    if (!mins || mins <= 0) return 'Invalid input: idleMinutes > 0 is required.'
    const cutoff = Date.now() - mins * 60_000
    try {
      const activities = await getAllActivities()
      const lastByTab = new Map<number, number>()
      for (const a of activities) lastByTab.set(a.tabId, a.lastActivityTime || a.updatedAt || a.createdAt)

      const tabs = await chrome.tabs.query({})
      let count = 0
      for (const t of tabs) {
        if (!t.id) continue
        if (keepPinned && t.pinned) continue
        if (t.active) continue
        const last = lastByTab.get(t.id) ?? 0
        if (last && last < cutoff) {
          await chrome.tabs.discard(t.id)
          count++
        }
      }
      return count ? `Discarded ${count} inactive tab(s) (> ${mins}m).` : `No inactive tabs older than ${mins}m.`
    } catch (e) {
      return `Failed to discard tabs. Ensure "tabs" permission is granted. Error: ${e}`
    }
  }
}
