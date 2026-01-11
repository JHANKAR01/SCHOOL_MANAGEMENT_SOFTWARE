import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // url: process.env.DATABASE_URL!,
    url: process.env.DIRECT_URL!,
    // directUrl: process.env.DIRECT_URL!,
  },
});
