import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const currentDirectory = dirname(fileURLToPath(import.meta.url));
const compatibilityConfig = new FlatCompat({ baseDirectory: currentDirectory });

export default [
  ...compatibilityConfig.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [".next/**", "drizzle/**", "next-env.d.ts", "supabase/.temp/**"],
  },
];
