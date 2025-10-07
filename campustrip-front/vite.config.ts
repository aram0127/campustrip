import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // VitePWA 플러그인 설정 추가
    VitePWA({ 
      registerType: 'autoUpdate',
      // PWA 설치 시 보일 앱 정보
      manifest: {
        name: 'Campus Trip',
        short_name: 'CampusTrip',
        description: '대학생들을 위한 여행 동행 플랫폼',
        theme_color: '#28a745', // 우리 앱의 기본 색상
        icons: [
          {
            src: 'icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})