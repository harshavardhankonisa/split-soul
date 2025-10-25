import type { Tool } from '../types'

export const duplicateTabTool: Tool = {
  name: 'duplicate_tab',
  description: 'Duplicate the current active tab or a specified tab.',
  inputSchema: '{ "tabId?": number }',
  async execute(input: unknown): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { tabId } = typeof input === 'object' && input ? (input as any) : {}
    try {
      let targetId: number | undefined = typeof tabId === 'number' ? tabId : undefined
      if (targetId == null) {
        const [active] = await chrome.tabs.query({ active: true, currentWindow: true })
        if (!active?.id) return 'No active tab to duplicate.'
        targetId = active.id
      }
      const created = await chrome.tabs.duplicate(targetId)
      return `Duplicated tab #${targetId} -> new tab #${created?.id}`
    } catch (e) {
      return `Failed to duplicate tab. Ensure "tabs" permission is granted. Error: ${e}`
    }
  }
}
