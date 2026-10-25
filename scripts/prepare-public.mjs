import { copyFile, mkdir, readdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDirectory = path.join(projectRoot, 'public');
const siteScriptsDirectory = path.join(projectRoot, 'site-scripts');
const publicSiteScriptsDirectory = path.join(publicDirectory, 'site-scripts');
const optimizedDirectory = path.join(projectRoot, 'optimized');
const publicOptimizedDirectory = path.join(publicDirectory, 'optimized');
const staticExtensions = new Set([
  '.avif', '.gif', '.ico', '.jpeg', '.jpg', '.png', '.svg', '.webp',
  '.woff', '.woff2', '.ttf', '.otf', '.mp3', '.mp4', '.webm', '.pdf',
  '.txt', '.json', '.xml', '.js',
]);
const specialFiles = new Set(['CNAME', '_headers']);

await mkdir(publicDirectory, { recursive: true });
await Promise.all(['package.json', 'package-lock.json', 'sitemap.xml'].map((name) =>
  rm(path.join(publicDirectory, name), { force: true }),
));
await mkdir(publicSiteScriptsDirectory, { recursive: true });
const entries = await readdir(projectRoot, { withFileTypes: true });
let copiedCount = 0;

for (const entry of entries) {
  if (!entry.isFile()) continue;
  if (entry.name === 'package.json' || entry.name === 'package-lock.json') continue;
  const extension = path.extname(entry.name).toLowerCase();
  if (!staticExtensions.has(extension) && !specialFiles.has(entry.name)) continue;
  await copyFile(path.join(projectRoot, entry.name), path.join(publicDirectory, entry.name));
  copiedCount += 1;
}

const siteScripts = await readdir(siteScriptsDirectory, { withFileTypes: true });
let copiedScriptCount = 0;
for (const entry of siteScripts) {
  if (!entry.isFile() || path.extname(entry.name).toLowerCase() !== '.js') continue;
  await copyFile(
    path.join(siteScriptsDirectory, entry.name),
    path.join(publicSiteScriptsDirectory, entry.name),
  );
  copiedScriptCount += 1;
}

await mkdir(publicOptimizedDirectory, { recursive: true });
const optimizedAssets = await readdir(optimizedDirectory, { withFileTypes: true });
let copiedOptimizedCount = 0;
for (const entry of optimizedAssets) {
  if (!entry.isFile() || path.extname(entry.name).toLowerCase() !== '.webp') continue;
  await copyFile(
    path.join(optimizedDirectory, entry.name),
    path.join(publicOptimizedDirectory, entry.name),
  );
  copiedOptimizedCount += 1;
}

console.log(`Copied ${copiedCount} static site files, ${copiedScriptCount} page scripts and ${copiedOptimizedCount} optimized assets into public/.`);
