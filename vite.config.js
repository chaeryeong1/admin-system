import { defineConfig } from 'vite';

export default defineConfig({
  root: 'admin-system-html',
  build: {
    outDir: 'admin-system-html',
    emptyOutDir: true,
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: 'admin-system-html/index.html',
        business: 'admin-system-html/html/business-management.html',
        company: 'admin-system-html/html/company-management.html',
        gmoney: 'admin-system-html/html/gmoney-management.html',
        cashback: 'admin-system-html/html/cashback-management.html',
        notice: 'admin-system-html/html/notice-management.html'
      }
    }
  },
  base: '/'
}); 