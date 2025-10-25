import type { Tool, ToolRegistry } from './types'
import { listActionsTool } from './tools/list_actions'
import { completeActionTool } from './tools/complete_action'
import { searchChatsTool } from './tools/search_chats'
import { openTabTool } from './tools/open_tab'
import { searchWebTool } from './tools/search_web'
import { closeTabTool } from './tools/close_tab'
import { closeTabsByDomainTool } from './tools/close_tabs_by_domain'
import { closeInactiveTabsTool } from './tools/close_inactive_tabs'
import { closeDuplicatedTabsTool } from './tools/close_duplicated_tabs'
import { reloadTabTool } from './tools/reload_tab'
import { reloadStaleTabsTool } from './tools/reload_stale_tabs'
import { pinTabsByDomainTool } from './tools/pin_tabs_by_domain'
import { unpinAllTabsInWindowTool } from './tools/unpin_all_tabs_in_window'
import { muteOtherTabsTool } from './tools/mute_other_tabs'
import { muteAudibleTabsTool } from './tools/mute_audible_tabs'
import { unmuteAllTabsTool } from './tools/unmute_all_tabs'
import { moveTabsToNewWindowTool } from './tools/move_tabs_to_new_window'
import { mergeAllWindowsTool } from './tools/merge_all_windows'
import { groupTabsByDomainTool } from './tools/group_tabs_by_domain'
import { ungroupAllInWindowTool } from './tools/ungroup_all_in_window'
import { setGroupTitleColorTool } from './tools/set_group_title_color'
import { discardInactiveTabsTool } from './tools/discard_inactive_tabs'
import { duplicateTabTool } from './tools/duplicate_tab'
import { switchTabTool } from './tools/switch_tab'
import { highlightTabsByQueryTool } from './tools/highlight_tabs_by_query'

const registry: ToolRegistry = [
  listActionsTool,
  completeActionTool,
  searchChatsTool,
  openTabTool,
  searchWebTool,
  closeTabTool,
  closeTabsByDomainTool,
  closeInactiveTabsTool,
  closeDuplicatedTabsTool,
  reloadTabTool,
  reloadStaleTabsTool,
  pinTabsByDomainTool,
  unpinAllTabsInWindowTool,
  muteOtherTabsTool,
  muteAudibleTabsTool,
  unmuteAllTabsTool,
  moveTabsToNewWindowTool,
  mergeAllWindowsTool,
  groupTabsByDomainTool,
  ungroupAllInWindowTool,
  setGroupTitleColorTool,
  discardInactiveTabsTool,
  duplicateTabTool,
  switchTabTool,
  highlightTabsByQueryTool
]

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
