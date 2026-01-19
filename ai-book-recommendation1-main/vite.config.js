import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite configuration to build the JSX-based React app
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: true,
  },
});
