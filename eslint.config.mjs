import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
    { ignores: ["learnyounode/**"] },
    { files: ["**/*.{js,mjs,cjs}"], plugins: { js }, extends: ["js/recommended"] },
    { files: ["**/*.js"], languageOptions: { sourceType: "commonjs" } },
    {
        files: ["**/*.{js,mjs,cjs}"],
        languageOptions: {
            globals: {
                ...globals.browser,
                process: "readonly",
                __dirname: "readonly",
                __filename: "readonly",
            },
        },
    },
    {
        files: ["**/*.{mjs,cjs}"],
        languageOptions: {
            sourceType: "module",
            ecmaVersion: "latest",
        },
    },
]);
