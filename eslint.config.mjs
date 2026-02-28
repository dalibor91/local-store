import js from "@eslint/js";
import tseslint from "typescript-eslint";
import simpleImportSort from "eslint-plugin-simple-import-sort";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts"],
    languageOptions: {
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: {
        console: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        Promise: "readonly",
        fetch: "readonly",
        indexedDB: "readonly",
        IDBKeyRange: "readonly",
      },
    },
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      // Quotes: enforce double quotes (matches existing codebase)
      quotes: ["error", "double", { avoidEscape: true }],

      // Import order: side-effect → external → internal → parent → index → relative
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",

      // Popular strictness
      "no-console": "warn",
      eqeqeq: ["error", "always"],
      curly: ["error", "all"],
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "no-duplicate-imports": "error",
    },
  },
  {
    ignores: ["dist/**", "node_modules/**", "*.config.js"],
  },
);
