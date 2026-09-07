import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// defineConfig gives us TypeScript intellisense for the config options.
// The react() plugin enables JSX support and React Fast Refresh (live reload during dev).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // The port your dev server will run on
  },
})
