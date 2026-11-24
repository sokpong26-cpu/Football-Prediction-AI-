import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const distDir = path.join(rootDir, 'dist');
const androidPublicDir = path.join(rootDir, 'android', 'app', 'src', 'main', 'assets', 'public');

if (!fs.existsSync(distDir)) {
  console.error('[apk:sync] dist/ directory not found. Run "npm run build" first.');
  process.exit(1);
}

fs.rmSync(androidPublicDir, { recursive: true, force: true });
fs.mkdirSync(androidPublicDir, { recursive: true });
fs.cpSync(distDir, androidPublicDir, { recursive: true });

console.log(`[apk:sync] Synced web build from dist/ -> android/app/src/main/assets/public/`);
