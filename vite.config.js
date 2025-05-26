import { defineConfig } from 'vite';

export default defineConfig({
  root: 'admin-system-html',
  build: {
    outDir: 'admin-system-html',
    emptyOutDir: true,
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: 'index.html',
        business: 'html/business-management.html',
        company: 'html/company-management.html',
        gmoney: 'html/gmoney-management.html',
        cashback: 'html/cashback-management.html',
        notice: 'html/notice-management.html'
      }
    }
  },
  base: '/'
}); 