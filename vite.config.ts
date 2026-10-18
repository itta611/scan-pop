import { defineConfig, loadEnv } from "vite";
import { nitro } from "nitro/vite";
import { devtools } from "@tanstack/devtools-vite";
import { paraglideVitePlugin } from "@inlang/paraglide-js";

import { tanstackStart } from "@tanstack/react-start/plugin/vite";

import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const config = defineConfig(({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd(), "REDIS_"));
  return {
    resolve: { tsconfigPaths: true },
    plugins: [
      devtools(),
      paraglideVitePlugin({
        project: "./project.inlang",
        outdir: "./src/paraglide",
        strategy: ["url", "baseLocale"],
      }),
      tailwindcss(),
      tanstackStart({ router: { generatedRouteTree: "route-tree.gen.ts" } }),
      nitro({ preset: "node-server" }),
      viteReact(),
    ],
  };
});

export default config;
