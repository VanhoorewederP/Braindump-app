import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/Braindump-app/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['pwa-192x192.png', 'pwa-512x512.png'],
      manifest: {
        name: 'Braindump',
        short_name: 'Braindump',
        description: 'Persoonlijke productiviteits- en planning vault',
        theme_color: '#0891b2',
        background_color: '#F8FAFC',
        display: 'standalone',
        start_url: '/Braindump-app/',
        scope: '/Braindump-app/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        navigateFallback: '/Braindump-app/index.html',
        globPatterns: ['**/*.{js,css,html,png,svg}']
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