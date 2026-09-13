import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    // Proxies /api to the Express backend during local dev, so the frontend
    // can always call the relative path "/api" — same as in production when
    // the backend serves the built frontend from the same origin.
    proxy: {
      "/api": {
        target: process.env.VITE_API_PROXY_TARGET || "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
});
