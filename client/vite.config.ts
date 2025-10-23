import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
  let taggerPlugin = null;
  if (mode === "development") {
    try {
      // @ts-ignore - optional dev-only plugin may not be installed or have type declarations
      const mod = await import("vite-plugin-component-tagger");
      taggerPlugin = mod?.componentTagger?.();
    } catch (e) {
      taggerPlugin = null;
    }
  }

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [react(), taggerPlugin].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      outDir: "dist", // ✅ required for Vercel
      sourcemap: false,
    },
    base: "/", // ✅ ensure correct public path
  };
});
