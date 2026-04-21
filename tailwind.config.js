/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./HaemCalcPro_v4.jsx",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Body / UI: Inter for high legibility on wards and small screens
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
        // Headings / scores: Source Serif 4 for calm clinical hierarchy
        serif: [
          '"Source Serif 4"',
          'ui-serif',
          'Georgia',
          'Cambria',
          '"Times New Roman"',
          'Times',
          'serif',
        ],
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          '"Liberation Mono"',
          '"Courier New"',
          'monospace',
        ],
      },
      colors: {
        // Clinical-modern accent palette (CSS variables for easy theming)
        clinical: {
          ink:      'var(--hc-ink, #0f172a)',       // slate-900
          muted:    'var(--hc-muted, #475569)',      // slate-600
          surface:  'var(--hc-surface, #ffffff)',
          soft:     'var(--hc-soft, #f8fafc)',       // slate-50
          border:   'var(--hc-border, #e2e8f0)',     // slate-200
          accent:   'var(--hc-accent, #0f766e)',     // teal-700 (calm, non-alarming)
          accentFg: 'var(--hc-accent-fg, #ffffff)',
          warn:     'var(--hc-warn, #b45309)',       // amber-700
          danger:   'var(--hc-danger, #b91c1c)',     // red-700
          ok:       'var(--hc-ok, #15803d)',         // green-700
        },
      },
    },
  },
  plugins: [],
}
