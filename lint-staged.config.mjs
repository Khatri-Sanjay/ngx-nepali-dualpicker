export default {
	'*.{ts,js,cjs,mjs,html}': ['eslint --fix --max-warnings=0', 'prettier --write'],
	'*.{json,scss,css,md,yml,yaml}': 'prettier --write',
};
