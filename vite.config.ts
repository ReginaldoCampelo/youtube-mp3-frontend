import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

const port = Number(process.env.PORT) || 4173;

export default defineConfig({
  plugins: [tailwindcss()],
  preview: {
    port,
    host: "0.0.0.0",
  },
  server: {
    port,
    host: "0.0.0.0",
  },
});
