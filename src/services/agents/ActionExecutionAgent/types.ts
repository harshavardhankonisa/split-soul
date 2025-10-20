export interface Tool {
  name: string
  description: string
  inputSchema: string
  execute: (input: unknown) => Promise<string>
}

export type ToolRegistry = Tool[]
