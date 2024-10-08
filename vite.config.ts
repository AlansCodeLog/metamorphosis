import { run } from "@alanscodelog/utils/node"
import glob from "fast-glob"
import path from "path"
import type { PluginOption } from "vite"
import { externalizeDeps } from "vite-plugin-externalize-deps"
import { defineConfig } from "vitest/config"


const typesPlugin = (): PluginOption => ({
	name: "typesPlugin",
	// eslint-disable-next-line no-console
	writeBundle: async () => run(`npm run build:types`).promise.catch(e => { console.log(e.stdout); process.exit(1) }).then(() => undefined),
})

// https://vitejs.dev/config/
export default async ({ mode }: { mode: string }) => defineConfig({
	plugins: [
		// it isn't enough to just pass the deps list to rollup.external since it will not exclude subpath exports
		externalizeDeps(),
		// runs build:types script which takes care of generating types
		typesPlugin(),
	],
	build: {
		outDir: "dist",
		lib: {
			entry: glob.sync(path.resolve(import.meta.dirname, "src/**/*.ts")),
			formats: ["es"],
		},
		rollupOptions: {
			output: {
				preserveModulesRoot: "src",
				preserveModules: true,
			},
		},
		// if this is a library
		minify: false,
		...(mode === "production" ? {
			// if this is an app
			// minify: true
		} : {
			minify: false,
			sourcemap: "inline",
		}),
	},
	test: {
		environment: "jsdom",
		cache: process.env.CI ? false : undefined,
	},
	server: {
		// for locally linked repos when using vite server (i.e. not needed for libraries)
		fs: {
			allow: [...(process.env.CODE_PROJECTS ?? [])!],
		},
		watch: {
			// for pnpm
			followSymlinks: true,
			// watch changes in linked repos
			ignored: ["!**/node_modules/@alanscodelog/**"],
		},
	},
})
