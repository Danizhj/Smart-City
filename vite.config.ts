import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react(), tailwindcss()],
    define: {
      "process.env.VITE_TOMTOM_KEY": JSON.stringify(env.VITE_TOMTOM_KEY),
      "process.env.VITE_GROQ_API_KEY": JSON.stringify(env.VITE_GROQ_API_KEY),
    },
    resolve: {
      // alias: {
      //   "@": path.resolve(__dirname, "."),
      // },
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    // server: {
    //   hmr: process.env.DISABLE_HMR !== "true",
    // },
  };
});
