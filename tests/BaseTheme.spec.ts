import { testName } from "@alanscodelog/utils"
import { baseTheme } from "BaseTheme/BaseTheme.js"
import { describe, expect, it } from "vitest"


describe(testName(), () => {
	it("base theme", () => {
		// ignore, just to manually inspect the theme
		console.log("css", baseTheme.value)
		console.log("deps", baseTheme.dependencies)
		expect(true).to.equal(true)
	})
})
