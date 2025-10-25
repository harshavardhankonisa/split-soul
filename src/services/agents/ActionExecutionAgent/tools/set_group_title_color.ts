import type { Tool } from '../types'

export const setGroupTitleColorTool: Tool = {
  name: 'set_group_title_color',
  description: 'Rename and/or recolor a tab group.',
  inputSchema:
    '{ "groupId": number, "title?": string, "color?": "grey"|"blue"|"red"|"yellow"|"green"|"pink"|"purple"|"cyan" }',
  async execute(input: unknown): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { groupId, title, color } = typeof input === 'object' && input ? (input as any) : {}
    let gId = Number(groupId)
    if (!Number.isFinite(gId) || gId <= 0) {
      const [active] = await chrome.tabs.query({ active: true, currentWindow: true })
      gId = (active?.groupId as number | undefined) ?? -1
      if (!Number.isFinite(gId) || gId === -1) return 'No groupId provided and active tab not in a group.'
    }
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (chrome.tabGroups.update as any)(gId, {
        title: title ? String(title) : undefined,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        color: color as any
      })
      return `Updated group #${gId}`
    } catch (e) {
      return `Failed to update group. Ensure "tabGroups" permission is granted. Error: ${e}`
    }
  }
}
