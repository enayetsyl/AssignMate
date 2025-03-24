import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Extend Next.js's recommended ESLint configurations for core web vitals and TypeScript
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    // This configuration applies to all JavaScript/TypeScript files
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      // Use the latest ECMAScript version and module source type
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: {
      // Enforce semicolons at the end of statements
      semi: ["error", "always"],
      // Use single quotes for strings
      quotes: ["error", "single"],
      // Warn on unused variables (you can tweak this as needed)
      "no-unused-vars": "warn",
      // Warn when console statements are used in production code
      "no-console": "warn",
      // You can add or modify additional rules below:
      // "rule-name": "error" | "warn" | "off",
    },
  },
];

export default eslintConfig;
