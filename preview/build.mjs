import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const source = name => readFileSync(new URL(name, import.meta.url), 'utf8');
const photo = readFileSync(new URL('starter-workspace.webp', import.meta.url)).toString('base64');
const pages = {
  HOME: source('index.html'),
  SEARCH: source('search-preview.html'),
  EXPLORE: source('explore.html'),
  START: source('start.html').replace('__STARTER_IMAGE__', 'data:image/webp;base64,' + photo),
};
mkdirSync('preview-build', {recursive: true});
writeFileSync('preview-build/private-preview.mjs', source('worker.mjs').replace(/"__(HOME|SEARCH|START|EXPLORE)__"/g,
  (_, name) => JSON.stringify(pages[name])));
