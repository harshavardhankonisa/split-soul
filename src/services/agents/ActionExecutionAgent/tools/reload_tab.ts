import type { Tool } from '../types'

export const reloadTabTool: Tool = {
  name: 'reload_tab',
  description: 'Reload current or specified tab, optionally bypassing cache.',
  inputSchema: '{ "tabId?": number, "bypassCache?": boolean }',
  async execute(input: unknown): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { tabId, bypassCache } = typeof input === 'object' && input ? (input as any) : {}
    try {
      let targetId: number | undefined = typeof tabId === 'number' ? tabId : undefined
      if (targetId == null) {
        const [active] = await chrome.tabs.query({ active: true, currentWindow: true })
        if (!active?.id) return 'No active tab to reload.'
        targetId = active.id
      }
      await chrome.tabs.reload(targetId, { bypassCache: Boolean(bypassCache) })
      return `Reloaded tab #${targetId}${bypassCache ? ' (bypass cache)' : ''}`
    } catch (e) {
      return `Failed to reload tab. Ensure "tabs" permission is granted. Error: ${e}`
    }
  }
}
