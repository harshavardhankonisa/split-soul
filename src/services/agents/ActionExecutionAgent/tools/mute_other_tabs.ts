import type { Tool } from '../types'

export const muteOtherTabsTool: Tool = {
  name: 'mute_other_tabs',
  description: 'Mute all tabs except the active one in the current window.',
  inputSchema: '{ "exceptActive?": boolean }',
  async execute(input: unknown): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { exceptActive } = typeof input === 'object' && input ? (input as any) : {}
    const excludeActive = exceptActive !== false
    try {
      const tabs = await chrome.tabs.query({ currentWindow: true })
      const active = tabs.find(t => t.active)
      let count = 0
      for (const t of tabs) {
        if (!t.id) continue
        if (excludeActive && t.id === active?.id) continue
        await chrome.tabs.update(t.id, { muted: true as unknown as undefined })
        count++
      }
      return count ? `Muted ${count} tab(s) in current window.` : 'No tabs to mute.'
    } catch (e) {
      return `Failed to mute tabs. Ensure "tabs" permission is granted. Error: ${e}`
    }
  }
}
