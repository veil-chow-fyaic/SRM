import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from "vite-plugin-singlefile"
import fs from 'fs'
import path from 'path'

const inlineFavicon = () => {
  return {
    name: 'inline-favicon',
    transformIndexHtml(html) {
      const faviconPath = path.resolve(__dirname, 'public/vite.svg')
      if (fs.existsSync(faviconPath)) {
        const faviconContent = fs.readFileSync(faviconPath)
        const base64Favicon = `data:image/svg+xml;base64,${faviconContent.toString('base64')}`
        return html.replace(/href="\.?\/vite\.svg"/, `href="${base64Favicon}"`)
      }
      return html
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), viteSingleFile(), inlineFavicon()],
  base: './',
  publicDir: false, // Do not copy public assets
  build: {
    outDir: 'dist-standalone',
    emptyOutDir: true,
  }
})
