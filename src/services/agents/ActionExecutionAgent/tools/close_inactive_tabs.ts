import type { Tool } from '../types'
import { getAllActivities } from '../../../dexie/collections/activity'

export const closeInactiveTabsTool: Tool = {
  name: 'close_inactive_tabs',
  description: 'Close tabs that have been inactive for N minutes (based on lastActivityTime) with optional keepPinned.',
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
      const toClose: number[] = []
      for (const t of tabs) {
        if (!t.id) continue
        if (keepPinned && t.pinned) continue
        if (t.active) continue
        if (t.audible) continue
        const last = lastByTab.get(t.id) ?? 0
        if (last && last < cutoff) toClose.push(t.id)
      }
      if (toClose.length === 0) return `No inactive tabs older than ${mins}m.`
      await chrome.tabs.remove(toClose)
      return `Closed ${toClose.length} inactive tab(s) (> ${mins}m).`
    } catch (e) {
      return `Failed to close inactive tabs. Ensure "tabs" permission is granted. Error: ${e}`
    }
  }
}
