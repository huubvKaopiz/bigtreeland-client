module.exports = {
	env: {
		browser: true,
		es2021: true,
	},
	extends: [
		"eslint:recommended",
		"plugin:react/recommended",
		"plugin:@typescript-eslint/recommended",
		"plugin:react-hooks/recommended",
	],
	parser: "@typescript-eslint/parser",
	parserOptions: {
		ecmaFeatures: {
			jsx: true,
		},
		ecmaVersion: 13,
		sourceType: "module",
	},
	plugins: ["react", "@typescript-eslint"],
	rules: {
		"react-hooks/rules-of-hooks": "warn",
		"react-hooks/exhaustive-deps": "warn",
		"@typescript-eslint/no-explicit-any": "warn",
		"@typescript-eslint/explicit-module-boundary-types": "warn",
		"react/react-in-jsx-scope": "off",
		"prefer-const": "off",
		"@typescript-eslint/prefer-as-const": "off",
		"no-mixed-spaces-and-tabs": "off",
		"react/display-name": "off",
		"react/jsx-key": "off",
		"no-unsafe-optional-chaining": "off",
		"no-debugger": "warn",
	},
};
