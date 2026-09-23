import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three')) return 'vendor-three'
          if (id.includes('node_modules/gsap')) return 'vendor-gsap'
          if (id.includes('node_modules/react')) return 'vendor-react'
          if (id.includes('node_modules/lenis')) return 'vendor-lenis'
          if (id.includes('/components/Hero/')) return 'section-hero'
          if (id.includes('/components/WhyStride/')) return 'section-why-stride'
          if (id.includes('/components/Footer/')) return 'section-footer'
        },
      },
    },
  },
})
