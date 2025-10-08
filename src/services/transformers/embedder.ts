import { pipeline, env } from '@xenova/transformers'

env.backends.onnx.wasm.proxy = false
env.backends.onnx.wasm.numThreads = 1
env.backends.onnx.wasm.wasmPaths = chrome.runtime.getURL('wasm/')

const pipePromise = pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
  quantized: true
})

export async function getEmbeddingFromText(text: string): Promise<number[]> {
  const pipe = await pipePromise
  const output = await pipe(text, {
    pooling: 'mean',
    normalize: true
  })

  return Array.from(output.data)
}
