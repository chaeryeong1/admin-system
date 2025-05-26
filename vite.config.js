import { defineConfig } from 'vite';

export default defineConfig({
  root: 'admin-system-html',
  base: '/admin-system/',
  build: {
    outDir: '../dist',
    emptyOutDir: true
  }
}); 