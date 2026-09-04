import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  base: './', // Zorgt voor relatieve paden op GitHub Pages
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Braindump',
        short_name: 'Braindump',
        description: 'Mijn persoonlijke productiviteits- en planning vault',
        theme_color: '#0891b2',
        background_color: '#F8FAFC',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  server: {
    watch: {
      // Zorgt ervoor dat Vite stopt met meekijken in de Tauri build-map
      ignored: ['**/src-tauri/**']
    }
  }
});