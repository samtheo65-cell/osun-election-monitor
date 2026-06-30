import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // Disable the React 19 rule that complains about setState() inside effects.
  {
    rules: {
      "react-hooks/set-state-in-effect": "off",
    },
  },

  // Add extra ignores (keep Next's defaults + exclude scripts utilities)
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "scripts/**",
  ]),
]);

export default eslintConfig;