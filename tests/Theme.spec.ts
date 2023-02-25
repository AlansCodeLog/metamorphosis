import { testName } from "@alanscodelog/utils"
import { Theme } from "Theme.js"
import { Var } from "Var.js"
import { VarGroup } from "VarGroup.js"
import { describe, expect, it, vi } from "vitest"


describe(testName(), () => {
	it("simple theme", () => {
		const fontFamilyPrimaryVar = new Var(
			"font-family-primary",
			{ _: ["", ""]},
			"Font1"
		)
		const fontFamilySecondaryVar = new Var(
			"font-family-secondary",
			{ _: ["", ""]},
			"Font2"
		)

		const fontFamilySetting = new VarGroup(
			"font-family",
			{
				regular: fontFamilyPrimaryVar,
				heading: fontFamilySecondaryVar,
			}
		)
		const fontFamilySetting2 = new VarGroup(
			"font-family",
			{
				regular2: fontFamilyPrimaryVar,
				heading2: fontFamilySecondaryVar,
			}
		)
		const theme = new Theme("theme", { fontFamilySetting })

		expect(theme.value).to.deep.equal({
			"font-family-regular": "Font1",
			"font-family-heading": "Font2",
		})

		expect(theme.dependencies).to.deep.equal({
			"font-family-primary": "Font1",
			"font-family-secondary": "Font2",
		})

		const onChange = vi.fn(() => { })
		theme.on("change", onChange)
		theme.set("fontFamilySetting", fontFamilySetting2)
		expect(onChange.mock.calls.length).to.equal(1)
	})
})
