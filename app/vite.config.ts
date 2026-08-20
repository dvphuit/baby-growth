import { gzipSync } from 'node:zlib';
import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';
import path from 'node:path';

const ENTRY_CHUNK_BUDGET_BYTES = 500_000;
const ENTRY_GZIP_BUDGET_BYTES = 165_000;

function performanceBudgetPlugin(): Plugin {
  return {
    name: 'performance-budget',
    apply: 'build',
    generateBundle(_options, bundle) {
      Object.values(bundle).forEach((output) => {
        if (output.type !== 'chunk' || !output.isEntry) return;

        const rawBytes = Buffer.byteLength(output.code, 'utf8');
        const gzipBytes = gzipSync(output.code).byteLength;
        if (rawBytes <= ENTRY_CHUNK_BUDGET_BYTES && gzipBytes <= ENTRY_GZIP_BUDGET_BYTES) return;

        this.error(
          `Entry chunk ${output.fileName} exceeds the performance budget: `
          + `${rawBytes} raw bytes / ${gzipBytes} gzip bytes `
          + `(limits: ${ENTRY_CHUNK_BUDGET_BYTES} / ${ENTRY_GZIP_BUDGET_BYTES}).`,
        );
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  plugins: [
    performanceBudgetPlugin(),
    basicSsl(),
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'autoUpdate',
      injectRegister: 'auto',

      pwaAssets: {
        disabled: false,
        config: true,
      },

      manifest: {
        name: 'BabyGrowth AI - Theo dõi Bé & Mẹ',
        short_name: 'BabyGrowth',
        description: 'Ứng dụng theo dõi phát triển Bé & Chăm sóc Mẹ chuẩn WHO (0-18 tuổi)',
        lang: 'vi',
        id: '/',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        display_override: ['standalone', 'minimal-ui', 'browser'],
        orientation: 'portrait',
        prefer_related_applications: false,
        theme_color: '#39261D',
        background_color: '#FAF8F5',
        icons: [
          {
            src: '/pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },

      injectManifest: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
      },

      devOptions: {
        enabled: true,
        navigateFallback: 'index.html',
        suppressWarnings: true,
        type: 'module',
      },
    }),
  ],
  server: {
    host: true,
  },
});
