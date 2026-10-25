import { copyFile, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const exportDirectory = path.join(projectRoot, 'out');
const routes = ['admin', 'analisis', 'faq', 'kantor'];

await Promise.all(['package.json', 'package-lock.json'].map((name) =>
  rm(path.join(exportDirectory, name), { force: true }),
));

for (const route of routes) {
  const exportedPage = path.join(exportDirectory, `${route}.html`);
  const cleanRouteDirectory = path.join(exportDirectory, route);
  await mkdir(cleanRouteDirectory, { recursive: true });
  await copyFile(exportedPage, path.join(cleanRouteDirectory, 'index.html'));
}

console.log('Created clean URL aliases in out/.');
