import { defineConfig, globalIgnores } from "eslint/config";
import jest from "eslint-plugin-jest";
import globals from "globals";
import babelParser from "@babel/eslint-parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

// FIXME eslint v9に対応できなかったので一時的にすべて無効にする
export default defineConfig([
  globalIgnores(["app/assets/js/*", "coverage/*"]),
  {
    extends: compat.extends("eslint:recommended"),

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
      ecmaVersion: 12,
      sourceType: "module",

      parserOptions: {
        requireConfigFile: false,

        babelOptions: {
          plugins: ["@babel/plugin-syntax-import-assertions"],
        },
      },
    },

    rules: {},
  },
]);
