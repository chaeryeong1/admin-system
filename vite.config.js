import { defineConfig } from 'vite';

export default defineConfig({
  root: 'admin-system-html',
  base: '/admin-system/',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: 'admin-system-html/index.html',
        business: 'admin-system-html/html/business-management.html',
        company: 'admin-system-html/html/company-management.html',
        cashback: 'admin-system-html/html/cashback-request.html',
        cashbackTransfer: 'admin-system-html/html/cashback-transfer.html',
        cashbackApproval: 'admin-system-html/html/cashback-approval.html',
        gmoney: 'admin-system-html/html/gmoney-management.html',
        selection: 'admin-system-html/html/selection-confirmation.html',
        notification: 'admin-system-html/html/business-notification.html',
        application: 'admin-system-html/html/application.html'
      }
    }
  }
}); 