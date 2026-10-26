import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import seoPlugin from './seo-plugin.mjs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    seoPlugin({ fallbackUrl: 'https://landlord-pack.vercel.app' }),
  ],
})