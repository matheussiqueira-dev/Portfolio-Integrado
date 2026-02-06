import { defineConfig } from "vite";

export default defineConfig({
    server: {
        host: true,
        port: 4173,
        proxy: {
            "/api": {
                target: "http://localhost:3000",
                changeOrigin: true
            }
        }
    },
    preview: {
        host: true,
        port: 4173
    }
});
