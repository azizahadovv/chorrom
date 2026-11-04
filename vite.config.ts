import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
    // Lokal dev: backend (Java) alohida portda — /api va /uploads unga uzatiladi
    proxy: {
      "/api": process.env.API_PROXY || "http://127.0.0.1:18080",
      "/uploads": process.env.API_PROXY || "http://127.0.0.1:18080",
    },
  },
  preview: {
    // Vaqtinchalik tunnel orqali ko'rsatish: PREVIEW_HOSTS=".lhr.life" (vergul bilan bir nechta)
    allowedHosts: process.env.PREVIEW_HOSTS ? process.env.PREVIEW_HOSTS.split(",") : undefined,
    proxy: {
      "/api": process.env.API_PROXY || "http://127.0.0.1:18080",
      "/uploads": process.env.API_PROXY || "http://127.0.0.1:18080",
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // scripts/prerender.mjs har bir sahifaning JS chunk'ini oldindan yuklash uchun manifestni o'qiydi
    manifest: true,
  },
}));
