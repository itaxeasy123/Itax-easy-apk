// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  { ignores: [".expo/**", "dist/**", "android/**", "ios/**", "node_modules/**"] },
  expoConfig,
  {
    rules: {
      "import/no-unresolved": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "react-hooks/exhaustive-deps": "off",
      "import/no-named-as-default-member": "off",
    },
  },
]);
