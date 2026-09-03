import tseslint from "typescript-eslint";

const config = tseslint.config(
  {
    ignores: ["dist/**", "node_modules/**", "data/**", "lint-report.json", "jscpd-report/**"],
  },
  tseslint.configs.recommended,
  {
    plugins: {
      security: (await import("eslint-plugin-security")).default,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      complexity: ["error", 8],
      "max-depth": ["error", 3],
      "max-lines-per-function": ["warn", 60],
      indent: ["warn", 2],
      quotes: ["warn", "double"],
      semi: ["warn", "always"],
      "max-len": ["warn", { code: 100 }],
      "security/detect-eval-with-expression": "error",
      "security/detect-non-literal-fs-filename": "warn",
      "security/detect-object-injection": "off",
      "no-console": "warn",
    },
  },
  {
    files: ["test/**/*.ts"],
    rules: {
      "max-lines-per-function": "off",
    },
  }
);

export default config;
