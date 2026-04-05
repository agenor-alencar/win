// win-frontend/vite.config.ts
import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createServer } from "./server";

// Define the API base URL (backend direct URL)
const API_BASE_URL = process.env.VITE_API_BASE_URL || process.env.VITE_DEV_PROXY_TARGET || 'http://localhost:8080'; // Backend URL
const ALLOWED_HOSTS = (process.env.VITE_ALLOWED_HOSTS
  ? process.env.VITE_ALLOWED_HOSTS.split(",").map((host) => host.trim()).filter(Boolean)
  : [
      "winmarketplace.com.br",
      "www.winmarketplace.com.br",
      "localhost",
      "127.0.0.1",
    ]);

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: Number(process.env.FRONTEND_PORT) || 3000,
    proxy: {
      '/v1': {
        target: API_BASE_URL,
        changeOrigin: true,
        rewrite: (path) => `/api${path}`, // Adiciona /api antes de encaminhar para o backend
      },
    },
   
    allowedHosts: ALLOWED_HOSTS,
   
  },
  build: {
    outDir: "dist/spa",
  },
  plugins: [react(), expressPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
  define: {
    'process.env': process.env,
  },
}));

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve", // Only apply during development (serve mode)
    configureServer(server) {
      const app = createServer();

      // Add Express app as middleware to Vite dev server
      server.middlewares.use(app);
    },
  };
}