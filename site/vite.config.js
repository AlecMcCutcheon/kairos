import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  publicDir: false,
  build: {
    emptyOutDir: false,
    outDir: "dist-live",
    lib: {
      entry: resolve(__dirname, "src/live-main.js"),
      name: "KairosLive",
      formats: ["es"],
      fileName: () => "live.bundle.js",
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
    target: "es2022",
    sourcemap: true,
  },
});
