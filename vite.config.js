import { defineConfig } from 'vite';

export default defineConfig({
  root: 'admin-system-html',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    copyPublicDir: true
  },
  publicDir: 'admin-system-html',
  base: '/'
}); 