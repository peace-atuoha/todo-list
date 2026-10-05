import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base: "./" makes the built site work from any web address,
// including GitHub Pages (https://your-name.github.io/your-repo/).
export default defineConfig({
  base: "./",
  plugins: [react()],
});
