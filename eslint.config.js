import js from "@eslint/js";

import globals from "globals";

import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "dist",
      "build",
      "node_modules",
      ".turbo",
    ],
  },

  js.configs.recommended,

  ...tseslint.configs.recommended,

  {
    files: ["**/*.ts"],

    languageOptions: {
      globals: {
        ...globals.node,
      },
    },

    rules: {
      "@typescript-eslint/no-unused-vars":
        "error",

      "@typescript-eslint/no-explicit-any":
        "warn",
    },
  }
);