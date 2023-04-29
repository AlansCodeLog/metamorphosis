import { catchError, testName } from "@alanscodelog/utils"
import * as Format from "Format.js"
import * as Unit from "Unit.js"
import { Var } from "Var.js"
import { VarGroup } from "VarGroup.js"
import { describe, expect, it } from "vitest"


describe(testName(), () => {
	it("simple group setting", () => {
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
		expect(fontFamilySetting.rawValue.regular).to.equal(fontFamilyPrimaryVar)

		expect(fontFamilySetting.value).to.deep.equal({
			"font-family-regular": "Font1",
			"font-family-heading": "Font2",
		})
	})
	it("simple group setting", () => {
		const fontConflicting = new Var(
			"font-family-conflict",
			{ _: ["", ""]},
			"Font1"
		)
		const error = catchError(() => {
			const fontFamilySetting = new VarGroup(
				"font-family",
				{
					conflict: fontConflicting,
				}
			)
		})

		expect(error.message).to.include("font-family-conflict")
		expect(error.message).to.include("conflicts")
	})
})
