import { defineConfig } from "@alanscodelog/vite-config"

const config = defineConfig({}, {
	test: {
		environment: "jsdom"
	},
}, {
	build: {
		// @ts-expect-error
		lib: {
			formats: ["es", "cjs"]
		}
	}
})
export default config 
