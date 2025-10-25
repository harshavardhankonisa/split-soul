import type { Tool } from '../types'

export const muteAudibleTabsTool: Tool = {
  name: 'mute_audible_tabs',
  description: 'Mute all tabs that are currently producing audio.',
  inputSchema: '{ }',
  async execute(): Promise<string> {
    try {
      const tabs = await chrome.tabs.query({})
      let count = 0
      for (const t of tabs) {
        if (t.id && t.audible) {
          await chrome.tabs.update(t.id, { muted: true as unknown as undefined })
          count++
        }
      }
      return count ? `Muted ${count} audible tab(s).` : 'No audible tabs to mute.'
    } catch (e) {
      return `Failed to mute audible tabs. Ensure "tabs" permission is granted. Error: ${e}`
    }
  }
}
