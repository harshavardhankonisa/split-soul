import type { Tool } from '../types'

function normalizeUrl(u?: string | null): string {
  if (!u) return ''
  try {
    const url = new URL(u)
    url.hash = ''
    return url.toString()
  } catch {
    return ''
  }
}

export const closeDuplicatedTabsTool: Tool = {
  name: 'close_duplicated_tabs',
  description: 'Close duplicate tabs by normalized URL (keeps one copy).',
  inputSchema: '{ "scope?": "window"|"all" }',
  async execute(input: unknown): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { scope } = typeof input === 'object' && input ? (input as any) : {}
    try {
      const query: chrome.tabs.QueryInfo = scope === 'window' ? { currentWindow: true } : {}
      const tabs = await chrome.tabs.query(query)
      const firstByUrl = new Map<string, chrome.tabs.Tab>()
      const dups: number[] = []
      for (const t of tabs) {
        const key = normalizeUrl(t.url)
        if (!key || !t.id) continue
        if (!firstByUrl.has(key)) firstByUrl.set(key, t)
        else dups.push(t.id)
      }
      if (!dups.length) return 'No duplicate tabs found.'
      await chrome.tabs.remove(dups)
      return `Closed ${dups.length} duplicate tab(s).`
    } catch (e) {
      return `Failed to close duplicate tabs. Ensure "tabs" permission is granted. Error: ${e}`
    }
  }
}
