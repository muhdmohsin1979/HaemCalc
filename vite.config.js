import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base path depends on deploy target:
//   GitHub Pages at /HaemCalc/          -> base = '/HaemCalc/'  (default)
//   Cloudflare Worker at subdomain root -> base = '/'
// Set DEPLOY_TARGET=workers in the Cloudflare Workers build command,
// or use `npm run build:workers` locally.
const base = process.env.DEPLOY_TARGET === 'workers' ? '/' : '/HaemCalc/'

export default defineConfig({
  plugins: [react()],
  base,
})
