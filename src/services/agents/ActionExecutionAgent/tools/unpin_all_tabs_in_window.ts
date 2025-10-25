import type { Tool } from '../types'

export const unpinAllTabsInWindowTool: Tool = {
  name: 'unpin_all_tabs_in_window',
  description: 'Unpin all tabs in the current window.',
  inputSchema: '{ }',
  async execute(): Promise<string> {
    try {
      const tabs = await chrome.tabs.query({ currentWindow: true, pinned: true })
      let count = 0
      for (const t of tabs) {
        if (t.id && t.pinned) {
          await chrome.tabs.update(t.id, { pinned: false })
          count++
        }
      }
      return count ? `Unpinned ${count} tab(s) in current window.` : 'No pinned tabs in current window.'
    } catch (e) {
      return `Failed to unpin tabs. Ensure "tabs" permission is granted. Error: ${e}`
    }
  }
}
