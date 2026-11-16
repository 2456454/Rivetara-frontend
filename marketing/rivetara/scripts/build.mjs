import {readFileSync,writeFileSync,mkdirSync,rmSync,cpSync} from 'node:fs';
rmSync('dist',{recursive:true,force:true});mkdirSync('dist/server',{recursive:true});mkdirSync('dist/.openai',{recursive:true});
const template=readFileSync('worker/index.js','utf8');
writeFileSync('dist/server/index.js',template.replace('"__PAGE_HTML__"',JSON.stringify(readFileSync('src/index.html','utf8'))));
cpSync('.openai/hosting.json','dist/.openai/hosting.json');cpSync('drizzle','dist/drizzle',{recursive:true});
console.log('Built Worker and migration assets');
