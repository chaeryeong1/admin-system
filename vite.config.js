import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'admin-system-html',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'admin-system-html/template.html')
      }
    }
  },
  server: {
    port: 3000
  }
}); 