import { defineConfig } from "vite";
import { privatePreview } from "./preview/railway.mjs";

export default defineConfig({
 plugins: [{
   name: "rivetara-private-preview",
   async configurePreviewServer(server) {
     const workerUrl = new URL("./preview-build/private-preview.mjs", import.meta.url);
     const worker = (await import(workerUrl.href)).default;
     server.middlewares.use(privatePreview(worker, {
       accessKey: process.env.RIVETARA_PREVIEW_ACCESS_KEY,
       bridgeSecret: process.env.STARTER_PLAN_BRIDGE_SECRET,
     }));
   }
 }],
 preview: {
   host: "0.0.0.0",
   allowedHosts: [
     "rivetara-frontend-production.up.railway.app"
   ]
 },

 build: {
   sourcemap: true
 }
});
