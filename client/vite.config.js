import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    // Proxies /api (and /uploads, for Knowledge Base article images — see
    // server/routes/kbArticles.js's KB_UPLOADS_DIR and the express.static
    // mount in server/app.js) to the Express backend during local dev, so
    // the frontend can always use the same relative paths it uses in
    // production, when the backend serves the built frontend from the same
    // origin and no proxy is involved at all.
    proxy: {
      "/api": {
        target: process.env.VITE_API_PROXY_TARGET || "http://localhost:4000",
        changeOrigin: true,
      },
      "/uploads": {
        target: process.env.VITE_API_PROXY_TARGET || "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
});
