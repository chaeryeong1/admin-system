import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    copyPublicDir: true
  },
  publicDir: 'admin-system-html',
  base: '/'
}); 