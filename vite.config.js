import { defineConfig } from "vite";

export default defineConfig({
  root: "src",  // 👈 Set the source folder
  server: {
    port: 5173,  // 👈 Default Vite port
  },
});
