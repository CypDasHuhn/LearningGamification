import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  // Tailwind zuerst, damit CSS (inkl. @import "tailwindcss") vor React Router verarbeitet wird
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
});
