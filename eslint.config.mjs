// geoTotal — Copyright 2026 alessandrocdrx
// SPDX-License-Identifier: Apache-2.0
// Regras de qualidade do JavaScript (npm run lint). Roda na CI antes dos testes.
import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['web/geototal.html', 'android/**', 'node_modules/**', 'scripts/icone/icone.html'] },
  js.configs.recommended,
  {
    rules: {
      // erros ignorados de propósito (armazenamento indisponível, JSON inválido) usam catch vazio
      'no-empty': ['error', { allowEmptyCatch: true }],
      'no-unused-vars': ['error', { caughtErrors: 'none' }],
    },
  },
  {
    files: ['web/src/js/**/*.js'],
    languageOptions: {
      ecmaVersion: 2018,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        // bibliotecas carregadas como <script> (assets/www/lib): mapas e projeções
        d3: 'readonly', topojson: 'readonly', Datamap: 'readonly',
        // integrações: ponte nativa do Android e downloads do claude.ai
        AndroidBridge: 'readonly', claude: 'readonly',
      },
    },
  },
  {
    files: ['scripts/**/*.mjs', 'scripts/**/*.cjs', 'tests/**/*.mjs', 'eslint.config.mjs'],
    languageOptions: { ecmaVersion: 2022, sourceType: 'module', globals: { ...globals.node } },
  },
  {
    // scripts/icone/gerar.cjs passa funções ao navegador (window.ICON vem de icone.html)
    files: ['scripts/**/*.cjs'],
    languageOptions: { sourceType: 'commonjs', globals: { ...globals.browser, ICON: 'readonly' } },
  },
  {
    // funções passadas a page.evaluate() rodam no navegador
    files: ['tests/e2e/**/*.mjs', 'scripts/android-shim.js'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
];
