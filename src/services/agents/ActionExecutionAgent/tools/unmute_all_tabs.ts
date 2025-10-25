import type { Tool } from '../types'

export const unmuteAllTabsTool: Tool = {
  name: 'unmute_all_tabs',
  description: 'Unmute all tabs across all windows.',
  inputSchema: '{ }',
  async execute(): Promise<string> {
    try {
      const tabs = await chrome.tabs.query({})
      let count = 0
      for (const t of tabs) {
        if (t.id && t.mutedInfo?.muted) {
          await chrome.tabs.update(t.id, { muted: false as unknown as undefined })
          count++
        }
      }
      return count ? `Unmuted ${count} tab(s).` : 'No muted tabs found.'
    } catch (e) {
      return `Failed to unmute tabs. Ensure "tabs" permission is granted. Error: ${e}`
    }
  }
}
