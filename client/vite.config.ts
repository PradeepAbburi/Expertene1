import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
  // Try to dynamically load optional dev-only plugin
  let taggerPlugin = null;
  if (mode === 'development') {
    try {
      // dynamic import; if package is not installed we fall back
      // to null and continue starting the dev server
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = await import('lovable-tagger');
      taggerPlugin = mod?.componentTagger?.();
    } catch (e) {
      // package not available - skip the plugin
      // This prevents the dev server from crashing when the optional
      // package is not installed.
      // console.info('lovable-tagger not installed, skipping component tagging plugin');
      taggerPlugin = null;
    }
  }

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      taggerPlugin,
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
