import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [tailwindcss()],
  server: {
    port: Number(process.env.PORT) || 3001,
    host: true,
  },
});
