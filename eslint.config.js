// Import the base JavaScript ESLint ruleset
import js from '@eslint/js'

// Provides predefined global variables for browser environments (e.g., window, document)
import globals from 'globals'

// ESLint plugin that enforces the official React Hooks rules
import reactHooks from 'eslint-plugin-react-hooks'

// ESLint plugin that helps Vite + React refresh behavior (useful for dev hot-reloading)
import reactRefresh from 'eslint-plugin-react-refresh'

// Utility helpers for configuring ESLint using the newer flat config format
import { defineConfig, globalIgnores } from 'eslint/config'

// Export the ESLint configuration using the modern defineConfig syntax
export default defineConfig([
  // Ignore compiled build output so ESLint doesn't try to lint the dist/ folder
  globalIgnores(['dist']),

  {
    // Apply ESLint rules to all JavaScript and JSX files in the project
    files: ['**/*.{js,jsx}'],

    // Extend recommended rule sets for JavaScript, React Hooks, and Vite Refresh support
    extends: [
      js.configs.recommended,                   // Base JS rules
      reactHooks.configs['recommended-latest'], // Ensures correct useEffect/useState patterns
      reactRefresh.configs.vite,                // Vite-specific React refresh linting
    ],

    // Configure parsing and environment options
    languageOptions: {
      ecmaVersion: 2020,           // Allow modern ES2020 syntax
      globals: globals.browser,    // Register default browser globals (window, navigator…)
      parserOptions: {
        ecmaVersion: 'latest',     // Allow newest JavaScript syntax
        ecmaFeatures: { jsx: true }, // Enable JSX parsing for React files
        sourceType: 'module',      // Use ES modules instead of commonJS
      },
    },

    // Custom project-specific ESLint rule overrides
    rules: {
      // Throw an error for unused variables, but allow variables starting with capital letters or underscores
      // (useful for React components or intentionally ignored parameters)
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
])
