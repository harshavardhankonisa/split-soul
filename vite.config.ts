import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/index.html'),
        offscreen: resolve(__dirname, 'src/offscreen/index.html'),
        background: resolve(__dirname, 'src/background/background.ts'),
        content: resolve(__dirname, 'src/content/content.ts')
      },
      output: {
        entryFileNames: `[name].js`,
        assetFileNames: `[name].[ext]`
      }
    }
  }
})
