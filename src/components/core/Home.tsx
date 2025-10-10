import { useState, useEffect } from 'react'
import { Box, TextField, Button, Typography, Paper } from '@mui/material'
import { DynamicTool } from '@langchain/core/tools'
import { LLM } from '@langchain/core/language_models/llms'

// Chrome Prompt API LLM - Updated to new LanguageModel API
class ChromePromptLLM extends LLM {
  _llmType() {
    return 'chrome-prompt'
  }

  async _call(prompt: string): Promise<string> {
    try {
      // @ts-expect-error - Chrome LanguageModel API
      const availability = await window.LanguageModel.availability()

      if (availability === 'unavailable') {
        return 'Chrome LanguageModel not available on this device'
      }

      // @ts-expect-error - Chrome LanguageModel API
      const session = await window.LanguageModel.create()
      const response = await session.prompt(prompt)
      session.destroy()
      return response
    } catch (error) {
      console.error(error)
      return 'Chrome LanguageModel API not available or failed'
    }
  }
}

// Tool 1: Task Creator
const createTaskTool = new DynamicTool({
  name: 'create_task',
  description: 'Create a new task with given description',
  func: async (input: string) => {
    console.log('Creating task:', input)
    return `Task created: "${input}"`
  }
})

// Tool 2: Soul Searcher
const searchSoulsTool = new DynamicTool({
  name: 'search_souls',
  description: 'Search for souls by description',
  func: async (input: string) => {
    console.log('Searching souls:', input)
    return `Found 3 souls matching: "${input}"`
  }
})

const Home = () => {
  const [input, setInput] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [apiAvailable, setApiAvailable] = useState<boolean | null>(null)

  // Check API availability on component mount
  useEffect(() => {
    const checkAvailability = async () => {
      try {
        // @ts-expect-error - Chrome LanguageModel API
        const availability = await window.LanguageModel?.availability()
        setApiAvailable(availability !== 'unavailable')
      } catch {
        setApiAvailable(false)
      }
    }
    checkAvailability()
  }, [])

  const handleSubmit = async () => {
    if (!input.trim()) return

    setLoading(true)
    setResponse('')

    try {
      const llm = new ChromePromptLLM({})

      // Tool selection prompt
      const toolPrompt = `
User request: "${input}"

Available tools:
1. create_task - for creating tasks or to-dos
2. search_souls - for finding or searching souls/users

Analyze the user request and respond with ONLY one of these formats:
- If about creating tasks: USE_TOOL:create_task:${input}
- If about searching souls: USE_TOOL:search_souls:${input}
- Otherwise: DIRECT_RESPONSE

Response:`

      const llmResponse = await llm._call(toolPrompt)

      if (llmResponse.includes('USE_TOOL:create_task:')) {
        const taskInput = llmResponse.split('USE_TOOL:create_task:')[1]
        const result = await createTaskTool.func(taskInput)
        setResponse(result)
      } else if (llmResponse.includes('USE_TOOL:search_souls:')) {
        const searchInput = llmResponse.split('USE_TOOL:search_souls:')[1]
        const result = await searchSoulsTool.func(searchInput)
        setResponse(result)
      } else {
        // Direct LLM response
        const directPrompt = `User says: "${input}". Respond helpfully about task creation or soul searching.`
        const directResponse = await llm._call(directPrompt)
        setResponse(directResponse)
      }
    } catch (error) {
      setResponse('Error: Chrome Prompt API not available or failed')
      console.error(error)
    }

    setLoading(false)
    setInput('')
  }

  return (
    <Box sx={{ p: 2, maxWidth: 600 }}>
      <Typography variant='h6' gutterBottom>
        Agent Prototype
      </Typography>

      {apiAvailable === false && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: 'warning.light' }}>
          <Typography variant='body2' color='warning.dark'>
            ⚠️ Chrome LanguageModel API not available. Requires Chrome 138+ with Gemini Nano.
          </Typography>
        </Paper>
      )}

      {apiAvailable === true && (
        <Paper sx={{ p: 1, mb: 2, bgcolor: 'success.light' }}>
          <Typography variant='body2' color='success.dark'>
            ✅ Chrome LanguageModel API available
          </Typography>
        </Paper>
      )}

      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField
          fullWidth
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Try: 'Create a task to review code' or 'Search for developer souls'"
          onKeyDown={e => e.key === 'Enter' && !loading && handleSubmit()}
          disabled={loading}
        />
        <Button variant='contained' onClick={handleSubmit} disabled={loading || !input.trim()}>
          {loading ? 'Processing...' : 'Submit'}
        </Button>
      </Box>

      {response && (
        <Paper sx={{ p: 2 }}>
          <Typography variant='body2'>{response}</Typography>
        </Paper>
      )}
    </Box>
  )
}

export default Home
