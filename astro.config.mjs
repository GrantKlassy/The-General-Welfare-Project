import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  i18n: {
    defaultLocale: "en",
    locales: ["en", "es", "zh", "vi"],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "load",
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
