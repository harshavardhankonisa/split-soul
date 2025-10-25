import type { Tool } from '../types'

export const mergeAllWindowsTool: Tool = {
  name: 'merge_all_windows',
  description: 'Merge tabs from all windows into the current window.',
  inputSchema: '{ "keepGroups?": boolean }',
  async execute(): Promise<string> {
    try {
      const current = await chrome.windows.getCurrent()
      const tabs = await chrome.tabs.query({})
      const others = tabs.filter(t => t.windowId !== current.id && t.id)
      if (!others.length) return 'No other windows to merge.'
      const ids = others.map(t => t.id!) as number[]
      await chrome.tabs.move(ids, { windowId: current.id!, index: -1 })
      return `Merged ${ids.length} tab(s) into window #${current.id}.`
    } catch (e) {
      return `Failed to merge windows. Ensure "tabs" permission is granted. Error: ${e}`
    }
  }
}
