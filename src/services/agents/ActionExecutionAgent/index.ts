import { getToolsManifestForPrompt, findToolByName } from './tools'

class ChromePromptLLM {
  async call(prompt: string): Promise<string> {
    try {
      // @ts-expect-error - Chrome LanguageModel API
      const availability = await window.LanguageModel?.availability?.()
      if (availability === 'unavailable') return 'DIRECT_RESPONSE'
      // @ts-expect-error - Chrome LanguageModel API
      const session = await window.LanguageModel?.create?.()
      const response = await session.prompt(prompt)
      session.destroy()
      return response
    } catch {
      return 'DIRECT_RESPONSE'
    }
  }
}

function extractJsonObject(input: string): string | null {
  // Remove code fences and known wrappers
  let s = input.trim()
  s = s.replace(/^```[a-zA-Z]*\n?|```$/g, '').trim()
  s = s.replace(/^<json(-args)?>/i, '').trim()
  s = s.replace(/^json:?/i, '').trim()
  s = s.replace(/^args:?/i, '').trim()
  // If quoted, strip surrounding quotes
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1)
  }
  // Try to find the first {...} block
  const start = s.indexOf('{')
  const end = s.lastIndexOf('}')
  if (start >= 0 && end > start) {
    return s.slice(start, end + 1)
  }
  return null
}

function heuristicArgs(jsonArgStr: string): Record<string, unknown> {
  const s = jsonArgStr.trim()
  // URL fallback
  if (/^https?:\/\//i.test(s)) return { url: s }
  // query fallback like plain text
  if (s.length > 0) return { input: s }
  return {}
}

export async function runActionDescription(description: string): Promise<string> {
  const llm = new ChromePromptLLM()
  const manifest = getToolsManifestForPrompt()
  const toolPrompt =
    `You are a tool router. Decide whether to invoke a tool for the user's action.\n\n` +
    `Action description: "${description}"\n\n` +
    `${manifest}\n\n` +
    `Return EXACTLY ONE of the following formats (no extra text). IMPORTANT: If using a tool, the args MUST be a valid JSON object (no code fences, no <json> tags):\n` +
    `- USE_TOOL|<tool_name>|{...json object...}\n` +
    `- DIRECT_RESPONSE\n` +
    `Response:`

  const respRaw = await llm.call(toolPrompt)
  const resp = (respRaw || '').trim()

  if (resp.startsWith('USE_TOOL|')) {
    const firstLine = resp.split('\n')[0]
    const parts = firstLine.split('|')
    const toolName = parts[1]?.trim()
    const rawArgStr = parts.slice(2).join('|').trim()
    const tool = toolName ? findToolByName(toolName) : undefined
    if (!tool) return `No such tool: ${toolName}`

    try {
      // Try to clean and parse a JSON object if present
      const jsonStr = extractJsonObject(rawArgStr)
      const args = jsonStr ? JSON.parse(jsonStr) : heuristicArgs(rawArgStr)
      const result = await tool.execute(args)
      return typeof result === 'string' ? result : JSON.stringify(result)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      return `Tool execution failed: ${e?.message || 'unknown error'}`
    }
  }

  // Fallback: do nothing but acknowledge
  return 'No tool used. (DIRECT_RESPONSE)'
}

export function getToolsForPrompt() {
  // alias to expose the manifest externally
  return getToolsManifestForPrompt()
}
