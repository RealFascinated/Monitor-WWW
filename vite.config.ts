import { defineConfig } from "vite"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

import { env } from "./src/env/server"

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [devtools(), tailwindcss(), tanstackStart(), viteReact()],
  server: {
    host: true,
    allowedHosts: ["ehuwqehqwiuehqi.fascinated.cc"],
    proxy: {
      "/v1": {
        target: env.API_URL,
        changeOrigin: true,
      },
    },
  },
})

export default config
