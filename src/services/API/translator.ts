export interface TranslatorOptions {
  sourceLanguage: string
  targetLanguage: string
}

export const TranslatorAPI = {
  async checkAvailability(options: TranslatorOptions): Promise<'available' | 'downloading' | 'unavailable'> {
    // @ts-expect-error - Chrome Translator API
    return await window.Translator?.availability?.({
      sourceLanguage: options.sourceLanguage,
      targetLanguage: options.targetLanguage
    })
  },

  async create(p0: { sourceLanguage: string; targetLanguage: string }): Promise<void> {
    // @ts-expect-error - Chrome Translator API
    await window.Translator?.create?.({ ...p0 })
  },

  async translate(text: string, options: TranslatorOptions): Promise<string> {
    // @ts-expect-error - Chrome Translator API
    const translator = await window.Translator?.create?.({
      sourceLanguage: options.sourceLanguage,
      targetLanguage: options.targetLanguage
    })
    const result = await translator.translate(text)
    translator.destroy()
    return result
  }
}
