// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: { // <-- Add or modify this 'server' block
    host: true, // Optional: Makes the server listen on all network interfaces
    allowedHosts: [
      // Add your specific ngrok hostname here
      'postconquest-rentable-octavio.ngrok-free.dev', 
      '10.0.2.244',
      'http://172.20.0.1',
      // You might want to keep localhost as well
      'localhost',
      '127.0.0.1',
    ],
    proxy: {
        // APENAS requisições que começam com /api são enviadas para o backend
        '/api': {
            target: 'http://localhost:8000', // Seu backend FastAPI
            changeOrigin: true,
        },
        // Todas as outras requisições (ex: /, /planejamento, /assets/logo.png)
        // são tratadas pelo próprio Vite para servir o seu frontend React.
    }
  },
})