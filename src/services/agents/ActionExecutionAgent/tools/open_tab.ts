import type { Tool } from '../types'

export const openTabTool: Tool = {
  name: 'open_tab',
  description: 'Open a new browser tab to the specified URL. Returns the created tab id.',
  inputSchema: '{ "url": string, "active?": boolean }',
  async execute(input: unknown): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { url, active } = typeof input === 'object' && input ? (input as any) : {}
    const target = (url || '').toString().trim()
    if (!target) return 'Invalid input: url is required.'

    try {
      const created = await chrome.tabs.create({ url: target, active: active ?? true })
      return `Opened tab #${created.id} -> ${target}`
    } catch (e) {
      return `Failed to open tab. Ensure "tabs" permission is granted. Error: ${e}`
    }
  }
}
