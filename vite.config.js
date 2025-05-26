import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'admin-system-html',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'admin-system-html/index.html'),
        business: resolve(__dirname, 'admin-system-html/html/business-management.html'),
        company: resolve(__dirname, 'admin-system-html/html/company-management.html'),
        gmoney: resolve(__dirname, 'admin-system-html/html/gmoney-management.html'),
        cashback: resolve(__dirname, 'admin-system-html/html/cashback-management.html'),
        notice: resolve(__dirname, 'admin-system-html/html/notice-management.html')
      }
    }
  },
  publicDir: 'admin-system-html',
  base: '/'
}); 