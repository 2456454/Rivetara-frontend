import { defineConfig } from "vite";

export default defineConfig({
preview: {
host: "0.0.0.0",
allowedHosts: [
"rivetara-frontend-production.up.railway.app"
]
}
});
