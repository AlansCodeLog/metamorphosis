// advanced
import { tsEslintConfig, typescriptConfig } from "@alanscodelog/eslint-config"
export default tsEslintConfig( // this is just a re-export of tsEslint.config
	...typescriptConfig,
	// {
	// 	ignores: [
	// 	],
	// }
	// RULE LINKS
	// Eslint: https://eslint.org/docs/rules/
	// Typescript: https://typescript-eslint.io/rules/
	// Vue: https://eslint.vuejs.org/rules/
)
