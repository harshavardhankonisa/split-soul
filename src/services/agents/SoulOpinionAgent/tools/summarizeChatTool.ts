import { DynamicTool } from '@langchain/core/tools'
import { getAllChats } from '../../../dexie/collections/chat'
import { PromptAPI } from '../../../API/prompt'

export const summarizeChatTool = new DynamicTool({
  name: 'summarize_chats',
  description: 'Summarize the last few chat messages to understand discussion context.',
  func: async (input: string) => {
    const chats = await getAllChats({ sortByTime: true, limit: 5 })
    const combined = chats.map(c => `${c.user}: ${c.message}`).join('\n')

    const res = await PromptAPI.prompt(`Summarize the following messages:\n${combined}\nFocus: ${input}`)
    console.log('summarizeChatTool:')
    return res
  }
})
