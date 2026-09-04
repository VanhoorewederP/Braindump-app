import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  base: '/Braindump-app/', // Zorgt voor relatieve paden op GitHub Pages
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['pwa-192x192.png', 'pwa-512x512.png', 'assets/*'],
      manifest: {
        name: 'Braindump',
        short_name: 'Braindump',
        description: 'Mijn persoonlijke productiviteits- en planning vault',
        theme_color: '#06B6D4',
        background_color: '#F8FAFC',
        display: 'standalone',
        start_url: '/braindump-app/',
        scope: '/braindump-app/',
        orientation: 'portrait',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
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