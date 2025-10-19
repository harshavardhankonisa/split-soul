export interface ProofreadOptions {
  expectedInputLanguages?: string[]
}

export interface Correction {
  startIndex: number
  endIndex: number
  suggestion: string
}

export interface ProofreadResult {
  corrected: string
  corrections: Correction[]
}

export const ProofreaderAPI = {
  async checkAvailability(): Promise<'available' | 'downloading' | 'unavailable'> {
    // @ts-expect-error - Chrome Proofreader API
    return await window.Proofreader?.availability?.()
  },

  async proofread(text: string, options?: ProofreadOptions): Promise<ProofreadResult> {
    // @ts-expect-error - Chrome Proofreader API
    const proofreader = await window.Proofreader?.create?.({
      expectedInputLanguages: options?.expectedInputLanguages || ['en']
    })
    const result = await proofreader.proofread(text)
    proofreader.destroy()
    return result
  }
}
