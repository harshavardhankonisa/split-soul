import type { Tool, ToolRegistry } from './types'
import { listActionsTool } from './tools/list_actions'
import { completeActionTool } from './tools/complete_action'
import { searchChatsTool } from './tools/search_chats'
import { openTabTool } from './tools/open_tab'
import { searchWebTool } from './tools/search_web'

const registry: ToolRegistry = [listActionsTool, completeActionTool, searchChatsTool, openTabTool, searchWebTool]

export function getAllTools(): ToolRegistry {
  return registry
}

export function findToolByName(name: string): Tool | undefined {
  return registry.find(t => t.name === name)
}

export function getToolsManifestForPrompt(): string {
  return (
    'Available tools (MCP-style):\n' +
    registry
      .map(
        t =>
          `- name: ${t.name}\n  description: ${t.description}\n  input: ${t.inputSchema}\n  usage: USE_TOOL|${t.name}|{"field":"value"}`
      )
      .join('\n')
  )
}
