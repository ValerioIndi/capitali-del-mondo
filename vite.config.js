import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// base deve corrispondere al nome del repository, perché il sito su GitHub Pages
// viene servito da https://<utente>.github.io/capitali-del-mondo/
export default defineConfig({
  base: "/capitali-del-mondo/",
  plugins: [react()],
  server: {
    // usa la porta assegnata dall'ambiente se presente (altrimenti la default di Vite)
    port: process.env.PORT ? Number(process.env.PORT) : undefined,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
