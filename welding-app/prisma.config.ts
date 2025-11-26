import { loadEnvFile } from "process";

loadEnvFile();

export default {
  schema: "./prisma/schema.prisma",
};
