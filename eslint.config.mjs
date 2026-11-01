import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import angular from '@angular-eslint/eslint-plugin';
import angularTemplates from '@angular-eslint/eslint-plugin-template';
import angularTemplateParser from '@angular-eslint/template-parser';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import { fileURLToPath } from 'node:url';

export default tseslint.config(
	{
		ignores: [
			'node_modules/**',
			'dist/**',
			'.vercel/**',
			'tmp/**',
			'out-tsc/**',
			'coverage/**',
			'.angular/**',
			'.husky/_/**',
		],
	},
	{
		files: ['**/*.{js,cjs,mjs}'],
		extends: [eslint.configs.recommended],
		languageOptions: { globals: globals.node },
	},
	{
		files: ['apps/**/*.ts', 'libs/**/*.ts'],
		extends: [eslint.configs.recommended, ...tseslint.configs.recommended],
		languageOptions: {
			parserOptions: {
				project: './tsconfig.eslint.json',
				tsconfigRootDir: fileURLToPath(new URL('.', import.meta.url)),
			},
		},
		plugins: { '@angular-eslint': angular },
		processor: angularTemplates.processors['extract-inline-html'],
		rules: {
			...angular.configs.recommended.rules,
			'no-restricted-imports': [
				'error',
				{
					patterns: [
						{
							group: ['**/src/lib/**', '**/crux/**'],
							message:
								'Use the package public API from consumers and direct relative imports inside the library.',
						},
					],
				},
			],
			// Constructor injection and aliased signal adapters are supported by Angular 17.
			'@angular-eslint/prefer-inject': 'off',
			'@angular-eslint/no-input-rename': 'off',
			'@typescript-eslint/no-unused-vars': [
				'error',
				{ argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
			],
			'@typescript-eslint/no-floating-promises': 'error',
			'@typescript-eslint/no-misused-promises': 'error',
		},
	},
	{
		files: ['apps/**/*.html', 'libs/**/*.html'],
		languageOptions: { parser: angularTemplateParser },
		plugins: { '@angular-eslint/template': angularTemplates },
		rules: angularTemplates.configs.recommended.rules,
	},
	prettier,
);
