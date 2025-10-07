import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(() => ({
  base: "/chalin-shop-system/",
  server: { host: "::", port: 8080 },
  plugins: [react()], // 👈 ชั่วคราวตัดทุก plugin อื่นออก
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
}));
