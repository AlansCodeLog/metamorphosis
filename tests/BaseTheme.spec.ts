import { keys } from "@alanscodelog/utils/keys.js"
import { describe, expect, it } from "vitest"

import { baseTheme } from "../src/BaseTheme.js"
import { ControlVar } from "../src/ControlVar.js"
import { Units } from "../src/index.js"
import { createTailwindPlugin } from "../src/tailwind.js"


it.skip("base theme", () => {
	// ignore, just to manually inspect the theme
	console.log("css", baseTheme.css)
	expect(true).to.equal(false)
})
it("tailwindPlugin", () => {
	// ignore, just to manually inspect the theme
	baseTheme.add({ "color-fancy": new ControlVar(Units.px, 0) })
	let plugin: any

	expect(() => {
		plugin = createTailwindPlugin(baseTheme, {
			topLevel: ["color-neutral"],
			twTypeMap: { color: "colors" },
			convertValueMap: {
				color: key => `rgb(var(--${key}) / <alpha-value>)`,
			},
			defaultsMap: {
				"color-": "50",
				...Object.fromEntries(
					keys(baseTheme.value)
						.filter(key => {
							const entry = baseTheme.value[key]
							if (!("name" in entry)) return false
							return entry.name.startsWith("color-")
						})
						.map(key => [(baseTheme.value[key] as any).name, "500"])),
			},
		})
	}).to.not.throw()
	// console.log("plugin", pretty(plugin!))
})
it("can exclude variables from config", () => {
	// ignore, just to manually inspect the theme
	const plugin = createTailwindPlugin(baseTheme, {
		twTypeMap: { color: "colors" },
		convertValueMap: {
			color: (_entry, key) => `rgb(var(--${key}) / <alpha-value>)`,
		},
		excludeTw: ["color-neutral"],
	})
	expect((plugin.config!.theme!.extend!.colors as any)["50"]).to.equal(undefined)
	expect((plugin.config!.theme!.extend!.colors as any).warning).to.toBeDefined()
})
it("tailwindPlugin3", () => {
	// ignore, just to manually inspect the theme
	baseTheme.add({ fancy: new ControlVar(Units.px, 0) })
	expect(() => createTailwindPlugin(baseTheme, {
		twTypeMap: { color: "colors" },
		convertValueMap: {
			color: (_entry, key) => `rgb(var(--${key}) / <alpha-value>)`,
		},
	})).to.throw()
})
