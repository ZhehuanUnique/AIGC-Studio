import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        juchacha: resolve(__dirname, 'juchacha.html'),
        works: resolve(__dirname, 'works.html'),
        guide: resolve(__dirname, 'guide.html'),
      },
    },
  },
  server: {
    port: 3000,
    open: true
  }
})

