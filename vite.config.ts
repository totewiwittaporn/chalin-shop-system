// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { fileURLToPath } from "url";
// ถ้าจะใช้ lovable-tagger เฉพาะตอน dev:
// import { componentTagger } from "lovable-tagger";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => ({
  // สำคัญที่สุดสำหรับ GitHub Pages: ต้องตรงกับชื่อ repo
  base: "/chalin-shop-system/",

  server: { host: "::", port: 8080 },

  // ปิดปลั๊กอินพิเศษในโปรดักชันไปก่อน กันแครช
  plugins: [
    react(),
    // mode === "development" && componentTagger(),
  ].filter(Boolean),

  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
}));
