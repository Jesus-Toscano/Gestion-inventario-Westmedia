import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-index-to-404',
      writeBundle() {
        fs.copyFileSync(
          path.resolve('dist/index.html'),
          path.resolve('dist/404.html')
        )
      }
    }
  ],
  base: '/Gestion-inventario-Westmedia/',
})
