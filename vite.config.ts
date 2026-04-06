import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { tanstackRouter } from "@tanstack/router-plugin/vite"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    dedupe: ["react", "react-dom"],
    alias: {
      "@": path.resolve(__dirname, "./src"),
      react: path.resolve(__dirname, "./node_modules/react"),
      "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return

          if (id.includes("@tanstack")) return "vendor-tanstack"
          if (id.includes("@radix-ui")) return "vendor-radix"
          if (id.includes("/react/") || id.includes("/react-dom/") || id.includes("/scheduler/")) {
            return "vendor-react"
          }
          if (id.includes("recharts")) return "vendor-charts"
          if (id.includes("laravel-echo") || id.includes("pusher-js")) return "vendor-realtime"
          if (id.includes("axios")) return "vendor-http"
          if (id.includes("@base-ui")) return "vendor-baseui"
          if (id.includes("react-day-picker")) return "vendor-daypicker"
          if (id.includes("next-themes")) return "vendor-theme"
          if (id.includes("lucide-react")) return "vendor-icons"
          if (id.includes("date-fns")) return "vendor-date"
          if (id.includes("i18next") || id.includes("react-i18next")) return "vendor-i18n"
          if (id.includes("zod")) return "vendor-validation"

          return "vendor-misc"
        },
      },
    },
  },
})
