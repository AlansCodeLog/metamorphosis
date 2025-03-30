import { keys } from "@alanscodelog/utils/keys.js"
import { expect, it } from "vitest"

import { baseTheme } from "../src/BaseTheme.js"
import { ControlVar } from "../src/ControlVar.js"
import { Units } from "../src/index.js"
import { themeAsTailwindCss } from "../src/tailwind.js"


it.skip("base theme", () => {
	// ignore, just to manually inspect the theme
	console.log("css", baseTheme.css)
	expect(true).to.equal(false)
})
it("tailwind config", () => {
	// ignore, just to manually inspect the theme
	baseTheme.add({ "color-fancy": new ControlVar(Units.px, 0) })
	let config: any

	expect(() => {
		config = themeAsTailwindCss(baseTheme, {
			twTypeMap: { color: "colors" },
			convertValueMap: {
				color: key => `converted(var(--${key}) / <alpha-value>)`,
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
})
it("can exclude variables from config", () => {
	// ignore, just to manually inspect the theme
	const config = themeAsTailwindCss(baseTheme, {
		twTypeMap: { color: "colors" },
		convertValueMap: {
			color: (_entry, key) => `converted(var(--${key}) / <alpha-value>)`,
		},
		excludeTw: ["color-neutral"],
	})
	expect(config.includes("color-neutral")).to.equal(false)
})
it("tailwind config inspect", () => {
	// ignore, just to manually inspect the theme
	baseTheme.add({ fancy: new ControlVar(Units.px, 0) })
	expect(() => themeAsTailwindCss(baseTheme, {
		twTypeMap: { color: "colors" },
		convertValueMap: {
			color: (_entry, key) => `converted(var(--${key}) / <alpha-value>)`,
		},
	})).to.throw()
})
