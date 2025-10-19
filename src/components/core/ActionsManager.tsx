'use client'

import { useState } from 'react'
import { SoulOpinionAgent } from '../../services/agents/SoulOpinionAgent'

const ActionsManager = () => {
  const [output, setOutput] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [customPrompt, setCustomPrompt] = useState<string>('')
  const agent = new SoulOpinionAgent({})

  const normalPrompts = [
    'What is artificial intelligence?',
    'Explain machine learning in simple terms',
    'How does a neural network work?',
    'What are the benefits of AI?',
    'Describe the future of technology'
  ]

  const toolPrompts = [
    'Analyze sentiment: I love this product, it is amazing!',
    'Analyze sentiment: I hate waiting in lines',
    'Summarize chats: What was the main topic discussed?',
    'Analyze sentiment: This is okay, nothing special',
    'Summarize chats: Can you give me a brief overview?'
  ]

  const handlePrompt = async (prompt: string) => {
    setLoading(true)
    setOutput('')
    try {
      // Tool selection prompt
      const toolSelectionPrompt = `
User request: "${prompt}"

Available tools:
1. analyze_sentiment - Analyze sentiment and emotion of messages
2. summarize_chats - Summarize chat messages to understand context

Analyze the user request and respond with ONLY one of these formats:
- If about sentiment analysis: USE_TOOL:analyze_sentiment:${prompt}
- If about summarizing chats: USE_TOOL:summarize_chats:${prompt}
- Otherwise: DIRECT_RESPONSE

Response:`

      const toolDecision = await agent._call(toolSelectionPrompt)

      if (toolDecision.includes('USE_TOOL:analyze_sentiment:')) {
        const input = toolDecision.split('USE_TOOL:analyze_sentiment:')[1]?.trim()
        const result = await agent.tools[0].func(input || prompt)
        setOutput(result)
        console.log('Sentiment Tool Result:', result)
      } else if (toolDecision.includes('USE_TOOL:summarize_chats:')) {
        const input = toolDecision.split('USE_TOOL:summarize_chats:')[1]?.trim()
        const result = await agent.tools[1].func(input || prompt)
        setOutput(result)
        console.log('Summarize Tool Result:', result)
      } else {
        // Direct LLM response
        const response = await agent._call(prompt)
        setOutput(response)
        console.log('Direct Response:', response)
      }
    } catch (error) {
      console.error('Error:', error)
      setOutput('Error: ' + String(error))
    } finally {
      setLoading(false)
    }
  }

  const handleCustomPrompt = async () => {
    if (!customPrompt.trim()) {
      setOutput('Please enter a prompt')
      return
    }
    await handlePrompt(customPrompt)
    setCustomPrompt('')
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial', maxWidth: '800px', margin: '0 auto' }}>
      <h2>SoulOpinionAgent Test</h2>

      {/* Custom Prompt Section */}
      <div style={{ marginBottom: '30px', padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
        <h3>Custom Prompt:</h3>
        <textarea
          value={customPrompt}
          onChange={e => setCustomPrompt(e.target.value)}
          placeholder='Enter your custom prompt here...'
          style={{
            width: '100%',
            height: '80px',
            padding: '10px',
            marginBottom: '10px',
            fontFamily: 'Arial',
            borderRadius: '3px',
            border: '1px solid #ccc'
          }}
        />
        <button
          onClick={handleCustomPrompt}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? 'Processing...' : 'Send Prompt'}
        </button>
      </div>

      {/* Normal Prompts Section */}
      <div style={{ marginBottom: '30px' }}>
        <h3>Normal Prompts:</h3>
        <div style={{ display: 'grid', gap: '10px' }}>
          {normalPrompts.map((prompt, index) => (
            <button
              key={index}
              onClick={() => handlePrompt(prompt)}
              disabled={loading}
              style={{
                padding: '12px 15px',
                textAlign: 'left',
                backgroundColor: '#e8f4f8',
                border: '1px solid #007bff',
                borderRadius: '3px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                transition: 'background-color 0.2s'
              }}
            >
              {loading ? '⏳ Processing...' : '💬 ' + prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Tool Prompts Section */}
      <div style={{ marginBottom: '30px' }}>
        <h3>Tool Prompts (Sentiment & Summarize):</h3>
        <div style={{ display: 'grid', gap: '10px' }}>
          {toolPrompts.map((prompt, index) => (
            <button
              key={index}
              onClick={() => handlePrompt(prompt)}
              disabled={loading}
              style={{
                padding: '12px 15px',
                textAlign: 'left',
                backgroundColor: '#f0e8f8',
                border: '1px solid #9b59b6',
                borderRadius: '3px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                transition: 'background-color 0.2s'
              }}
            >
              {loading ? '⏳ Processing...' : '🔧 ' + prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Output Section */}
      <div style={{ marginTop: '30px' }}>
        <h3>Response:</h3>
        <div
          style={{
            border: '2px solid #ccc',
            padding: '15px',
            borderRadius: '5px',
            minHeight: '150px',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            fontFamily: 'monospace',
            fontSize: '14px'
          }}
        >
          {output || 'Response will appear here...'}
        </div>
      </div>
    </div>
  )
}

export default ActionsManager
