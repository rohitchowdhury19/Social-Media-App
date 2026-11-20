import js from "@eslint/js";
import globals from "globals";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
  // 1. Ignore build and dependency folders
  {
    ignores: ["dist/*", "build/", "node_modules/*"],
  },
  // 2. Apply ESLint's recommended rules
  js.configs.recommended,
  // 3. Configure environment globals and custom rules
  {
    files: ["*/.{js,mjs,cjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off",
    },
  },
  // 4. Disable rules that conflict with Prettier (must be last)
  eslintConfigPrettier,
];