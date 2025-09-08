import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
// This simplified config allows Vite to automatically find and use your postcss.config.js
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // make sure this matches your dev port
    strictPort: true, // optional: fail if port is taken
    hmr: { overlay: true }, // ensures HMR works
    proxy: {
      "/api": {
        target: "http://localhost:3001", // backend server
        changeOrigin: true,
      },
    },
  },
});
