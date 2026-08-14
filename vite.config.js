import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  // Served from https://frontend-dev-challenge.github.io/frontend-dev-challenge/
  base: "/frontend-dev-challenge/",
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "stellar-sdk": ["@stellar/stellar-sdk"],
          "freighter-api": ["@stellar/freighter-api"],
        },
      },
    },
  },
});
