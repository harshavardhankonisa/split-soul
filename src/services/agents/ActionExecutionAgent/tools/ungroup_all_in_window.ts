import type { Tool } from '../types'

export const ungroupAllInWindowTool: Tool = {
  name: 'ungroup_all_in_window',
  description: 'Ungroup all tab groups in the current window.',
  inputSchema: '{ }',
  async execute(): Promise<string> {
    try {
      const current = await chrome.windows.getCurrent()
      const tabs = await chrome.tabs.query({ windowId: current.id })
      const grouped = tabs.filter(t => (t.groupId ?? -1) >= 0 && t.id).map(t => t.id!) as number[]
      if (!grouped.length) return 'No grouped tabs to ungroup.'
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (chrome.tabs.ungroup as any)(grouped as any)
      return `Ungrouped ${grouped.length} tab(s) in window #${current.id}.`
    } catch (e) {
      return `Failed to ungroup tabs. Ensure "tabs" and "tabGroups" permissions are granted. Error: ${e}`
    }
  }
}
