import { copyFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

async function copyDir(src, dest) {
  if (!existsSync(dest)) {
    await mkdir(dest, { recursive: true });
  }
  
  const files = [
    { src: 'admin-system-html/index.html', dest: 'dist/index.html' },
    { src: 'admin-system-html/html/business-management.html', dest: 'dist/html/business-management.html' },
    { src: 'admin-system-html/html/company-management.html', dest: 'dist/html/company-management.html' },
    { src: 'admin-system-html/html/gmoney-management.html', dest: 'dist/html/gmoney-management.html' },
    { src: 'admin-system-html/html/cashback-request.html', dest: 'dist/html/cashback-request.html' },
    { src: 'admin-system-html/html/cashback-transfer.html', dest: 'dist/html/cashback-transfer.html' },
    { src: 'admin-system-html/html/googoedribe.html', dest: 'dist/html/googoedribe.html' },
    { src: 'admin-system-html/html/selection-confirmation.html', dest: 'dist/html/selection-confirmation.html' },
    { src: 'admin-system-html/html/business-notification.html', dest: 'dist/html/business-notification.html' },
    { src: 'admin-system-html/html/application.html', dest: 'dist/html/application.html' },
    { src: 'admin-system-html/html/cashback-approval.html', dest: 'dist/html/cashback-approval.html' },
    { src: 'admin-system-html/css/common-styles.css', dest: 'dist/css/common-styles.css' },
    { src: 'admin-system-html/js/common.js', dest: 'dist/js/common.js' }
  ];

  for (const file of files) {
    try {
      await copyFile(file.src, file.dest);
      console.log(`Copied ${file.src} to ${file.dest}`);
    } catch (error) {
      console.error(`Error copying ${file.src}:`, error);
    }
  }
}

copyDir('admin-system-html', 'dist').catch(console.error); 