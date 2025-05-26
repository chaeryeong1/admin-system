import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'admin-system-html',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    copyPublicDir: true,
    rollupOptions: {
      input: resolve(__dirname, 'admin-system-html/index.html')
    }
  },
  publicDir: 'admin-system-html',
  base: '/'
}); 