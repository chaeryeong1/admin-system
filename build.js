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
    { src: 'admin-system-html/html/cashback-management.html', dest: 'dist/html/cashback-management.html' },
    { src: 'admin-system-html/html/notice-management.html', dest: 'dist/html/notice-management.html' },
    { src: 'admin-system-html/css/common-styles.css', dest: 'dist/css/common-styles.css' },
    { src: 'admin-system-html/js/common.js', dest: 'dist/js/common.js' }
  ];

  for (const file of files) {
    await copyFile(file.src, file.dest);
    console.log(`Copied ${file.src} to ${file.dest}`);
  }
}

copyDir('admin-system-html', 'dist').catch(console.error); 