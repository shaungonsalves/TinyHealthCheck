module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module"
  },
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  rules: {
    // General code quality
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "no-constant-condition": "warn",

    // TypeScript-specific
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "warn",

    // Style preferences
    "semi": ["error", "always"],
    "quotes": ["error", "double"],
    "indent": ["error", 2]
  },
  ignorePatterns: [
    "dist/",
    "node_modules/"
  ]
};
