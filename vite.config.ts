import { defineConfig } from "@alanscodelog/vite-config"

export default defineConfig({}, {
	test: {
		environment: "jsdom"
	},
})
