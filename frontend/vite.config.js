import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'lionly-comfier-leonora.ngrok-free.dev', // 👈 your ngrok domain
    ],
    host: true, // 👈 allow external connections
  },
})
