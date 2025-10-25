import type { Tool } from '../types'

export const switchTabTool: Tool = {
  name: 'switch_tab',
  description: 'Activate next/previous tab or a tab at a specific index in the current window.',
  inputSchema: '{ "direction?": "next"|"prev", "index?": number }',
  async execute(input: unknown): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { direction, index } = typeof input === 'object' && input ? (input as any) : {}
    try {
      const win = await chrome.windows.getCurrent()
      const tabs = await chrome.tabs.query({ windowId: win.id })
      if (!tabs.length) return 'No tabs to switch.'
      const activeIdx = tabs.findIndex(t => t.active)
      let targetIdx: number | undefined
      if (direction === 'next') targetIdx = (activeIdx + 1) % tabs.length
      else if (direction === 'prev') targetIdx = (activeIdx - 1 + tabs.length) % tabs.length
      else if (Number.isFinite(index)) targetIdx = Math.min(Math.max(0, Number(index)), tabs.length - 1)
      else targetIdx = (activeIdx + 1) % tabs.length
      const target = tabs[targetIdx]
      if (!target?.id) return 'Could not resolve target tab.'
      await chrome.tabs.update(target.id, { active: true })
      return `Activated tab #${target.id} (index ${targetIdx}).`
    } catch (e) {
      return `Failed to switch tab. Ensure "tabs" permission is granted. Error: ${e}`
    }
  }
}
