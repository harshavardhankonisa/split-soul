import type { Tool } from '../types'

export const searchWebTool: Tool = {
  name: 'search_web',
  description: 'Open a new tab with search results for the given query using the default search engine (via web URL).',
  inputSchema: '{ "query": string, "engine?": "google" | "duckduckgo" | "bing" }',
  async execute(input: unknown): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { query, engine } = typeof input === 'object' && input ? (input as any) : {}
    const q = (query || '').toString().trim()
    if (!q) return 'Invalid input: query is required.'

    const e = (engine || 'google') as 'google' | 'duckduckgo' | 'bing'
    const url =
      e === 'duckduckgo'
        ? `https://duckduckgo.com/?q=${encodeURIComponent(q)}`
        : e === 'bing'
          ? `https://www.bing.com/search?q=${encodeURIComponent(q)}`
          : `https://www.google.com/search?q=${encodeURIComponent(q)}`

    try {
      const created = await chrome.tabs.create({ url, active: true })
      return `Opened search tab #${created.id} (${e}) for: ${q}`
    } catch (err) {
      return `Failed to open search tab. Ensure "tabs" permission is granted. Error: ${err}`
    }
  }
}
