import { defineConfig, globalIgnores } from "eslint/config";
import jest from "eslint-plugin-jest";
import globals from "globals";
import babelParser from "@babel/eslint-parser";
import js from "@eslint/js";

export default defineConfig([
  globalIgnores(["app/assets/js/*", "coverage/*"]),
  {
    extends: [js.configs.recommended],

    plugins: {
      jest,
    },

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.webextensions,
        ...jest.environments.globals.globals,
        ...globals.node,
        luxon: false,
      },

      parser: babelParser,
      ecmaVersion: "latest",
      sourceType: "module",

      parserOptions: {
        requireConfigFile: false,
      },
    },

    rules: {},
  },
]);
