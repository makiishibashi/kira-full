// functions/eslint.config.js の中身
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: ["lib/"],
  },
    ...tseslint.configs.recommended,
];