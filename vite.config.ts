import { defineConfig } from "@alanscodelog/vite-config"

const config = defineConfig({}, {
	test: {
		environment: "jsdom"
	},
})
export default config
