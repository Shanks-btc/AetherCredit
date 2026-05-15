import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        og: {
          primary:   '#6366f1',
          secondary: '#8b5cf6',
          accent:    '#06b6d4',
          dark:      '#0f172a',
          card:      '#1e293b',
          border:    '#334155',
        },
      },
    },
  },
  plugins: [],
} satisfies Config