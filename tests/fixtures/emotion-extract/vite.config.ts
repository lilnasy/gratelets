import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import emotion from "@emotion-extract/vite";
import "@emotion-extract/vite/env";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths(), emotion()],
});
