import type { Tool } from '../types'

export const closeTabTool: Tool = {
  name: 'close_tab',
  description: 'Close the current active tab or a specified tab by id.',
  inputSchema: '{ "tabId?": number }',
  async execute(input: unknown): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { tabId } = typeof input === 'object' && input ? (input as any) : {}
    try {
      let targetId: number | undefined = typeof tabId === 'number' && tabId > 0 ? tabId : undefined
      if (targetId == null) {
        const [active] = await chrome.tabs.query({ active: true, currentWindow: true })
        if (!active?.id) return 'No active tab to close.'
        targetId = active.id
      }
      await chrome.tabs.remove(targetId)
      return `Closed tab #${targetId}`
    } catch (e) {
      return `Failed to close tab. Ensure "tabs" permission is granted. Error: ${e}`
    }
  }
}
