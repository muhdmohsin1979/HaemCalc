import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base path depends on deploy target:
//   GitHub Pages at /HaemCalc/          -> base = '/HaemCalc/'  (default)
//   Cloudflare Worker at subdomain root -> base = '/'
// Set DEPLOY_TARGET=workers in the Cloudflare Workers build command,
// or use `npm run build:workers` locally.
const base = process.env.DEPLOY_TARGET === 'workers' ? '/' : '/HaemCalc/'

// Code-splitting strategy (Phase 1 — vendor split only).
//
// Background: the v3.3 revision programme grew the gzipped bundle from
// ~190 KB (PR #6) to 219 KB (PR #17), against a 220 KB budget cap.
// Refs: GitHub issue "Bundle size approaching v3.3 budget cap".
//
// This change splits long-term-cacheable vendor code (React + lucide
// icons) out of the main application chunk. Net effect:
//   - Total gzipped wire weight is unchanged
//   - Main application chunk drops by the size of the vendor code,
//     restoring meaningful headroom for further pathway/module
//     revisions
//   - Vendor chunk is content-hash-cached separately, so repeat
//     visits skip re-downloading React on every app revision
//
// Phase 2 (if needed later): genuine lazy-loading of PATHWAYS,
// DIAGNOSTICS, and large calculator categories via dynamic import().
// Requires application-code refactor; deferred until budget pressure
// returns.
export default defineConfig({
  plugins: [react()],
  base,
  build: {
    // Raise the warning threshold; we know the main app chunk is large
    // because it contains the full clinical-content monolith. The
    // 220 KB budget is tracked manually per PR rather than via this
    // warning.
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // React core + JSX runtime — long-term-cacheable, version-stable
          'vendor-react': ['react', 'react-dom', 'react/jsx-runtime'],
          // Icon library — separate chunk so icon additions don't
          // invalidate the React vendor cache
          'vendor-icons': ['lucide-react'],
        },
      },
    },
  },
})
