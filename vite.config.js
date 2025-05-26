import { defineConfig } from 'vite';

export default defineConfig({
  root: 'admin-system-html',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: 'admin-system-html/index.html'
      }
    }
  },
  base: '/'
}); 