import { catchError, testName } from "@alanscodelog/utils"
import * as Format from "Format.js"
import { InterpolatedVars } from "InterpolatedVars.js"
import * as Unit from "Unit.js"
import { Var } from "Var.js"
import { describe, expect, it } from "vitest"


describe(testName(), () => {
	it("simple string var", () => {
		const someVar = new Var(
			"some-var",
			{ _: ["", ""]},
			"Arial" // it's value
		)
		expect(someVar.rawValue).to.deep.equal({ _: "Arial" })
		expect(someVar.value).to.deep.equal({ "some-var": "Arial" })
	})
	it("throws if invalid variable name", () => {
		const error = catchError(() => {
			const someVar = new Var(
				"some var",
				{ key: ["", ""]},
				{ key: "val" } // it's value
			)
		})
		expect(error.message.toLowerCase()).to.contain("invalid variable name")
	})
	it("multikey var errors if missing formater", () => {
		const error = catchError(() => {
			const someVar = new Var(
				"some-var",
				{ key: ["", ""]},
				{ key: "val" } // it's value
			)
		})
		expect(error.message.toLowerCase()).to.contain("format")
	})
	it("multikey var does not error if only key of object value is _", () => {
		expect(() => {
			const someVar = new Var(
				"some-var",
				{ _: ["", ""]},
				{ _: "val" } // it's value
			)
		}).to.not.throw()
	})
	it("multikey var with custom formatter", () => {
		const someVar = new Var(
			"some-var",
			{ key: Unit._px },
			{ key: 1 },
			{ format: ({ key }) => `${key}-bla` }
		)
		expect(someVar.rawValue).to.deep.equal({ key: 1 })
		expect(someVar.value).to.deep.equal({ "some-var": "1px-bla" })
	})
	it("var set works", () => {
		const someVar = new Var(
			"some-var",
			Unit.px,
			{ _: 1 },
		)
		someVar.set(2)
		expect(someVar.rawValue).to.deep.equal({ _: 2 })
		expect(someVar.value).to.deep.equal({ "some-var": "2px" })
	})
	it("var set works with dependencies", () => {
		const someVar = new Var(
			"some-var",
			Unit.px,
			{ _: 1 },
		)

		const someVar2 = new Var(
			"some-var2",
			Unit.px,
			someVar
		)
		const someVar3 = new Var(
			"some-var3",
			Unit.px,
			someVar2
		)

		expect(someVar2.value).to.deep.equal({ "some-var2": "1px" })
		someVar.set(2)
		expect(someVar.rawValue).to.deep.equal({ _: 2 })
		expect(someVar.value).to.deep.equal({ "some-var": "2px" })
		expect(someVar2.rawValue).to.deep.equal(someVar)
		expect(someVar2.value).to.deep.equal({ "some-var2": "2px" })


		expect((someVar2 as any)._dependencies).to.deep.equal([someVar])
		someVar2.set(3)
		expect((someVar2 as any)._dependants).to.deep.equal([someVar3])
	})
	it("var set with dependency errors if using the same name", () => {
		const someVar = new Var(
			"some-var",
			Unit.px,
			{ _: 1 },
		)
		const error = catchError(() => {
			const someVar2 = new Var(
				"some-var",
				Unit.px,
				someVar
			)
		})
		expect(error.message.toLowerCase()).to.contain("same name")
	})
	it("takes other vars as values", () => {
		const pixels = new InterpolatedVars("pixels", Unit.px, { start: 0, end: 10, steps: 10 })
		const px1 = new Var(
			"px",
			Unit.px,
			1,
		)
		expect(px1.value).to.deep.equal({ px: "1px" })
		const px2 = new Var(
			"px2",
			Unit.px,
			px1
		)
		expect(px2.value).to.deep.equal({ px2: "1px" })

		const px3 = new Var(
			"px2",
			Unit.px,
			[pixels, "5"]
		)
		expect(px3.value).to.deep.equal({ px2: "5px" })
	})
	it("multi property vars can take other vars as sub values", () => {
		const pixels = new InterpolatedVars("pixels", Unit.px, { start: 0, end: 10, steps: 10 })
		const px1 = new Var(
			"px",
			{ _: Unit._px },
			1
		)
		expect(px1.value).to.deep.equal({ px: "1px" })
		const px2 = new Var(
			"px",
			{ px: Unit._px },
			{ px: px1 },
			{ format: Format.join }
		)
		expect(px2.value).to.deep.equal({ px: "1px" })
		const px3 = new Var(
			"px",
			{ px: Unit._px },
			{ px: [pixels, "5"]},
			{ format: Format.join }
		)
		expect(px3.value).to.deep.equal({ px: "5px" })
	})
	it("general use cases", () => {
		const white = new Var("white", Unit.rgb, { r: 255, g: 255, b: 255 }, {
			format: Format.rgb,
		})
		const black = new Var("black", Unit.rgb, { r: 0, g: 0, b: 0 }, {
			format: Format.rgb,
		})

		const grays = new InterpolatedVars("gray", Unit.rgb, {
			start: white,
			end: black,
			steps: 10,
			format: Format.rgb,
		})

		const colorVar = new Var(
			"color",
			Unit.rgb,
			{ r: 0, g: 0, b: 0 },
			{ format: Format.rgb }
		)
		expect(colorVar.value).to.deep.equal({ color: "rgb(0, 0, 0)" })
		const colorVar2 = new Var(
			"color",
			Unit.hsl,
			{ h: 0, s: 0, l: 0 },
			{ format: Format.hsl }
		)
		expect(colorVar2.value).to.deep.equal({ color: "hsl(0deg, 0%, 0%)" })
		const borderType = new Var(
			"border-type",
			Unit.borderType,
			"solid",
		)

		const borderWidth = new Var(
			"border-width",
			Unit.px,
			1,
		)

		const border = new Var(
			"border",
			Unit.border,
			{ w: borderWidth, type: borderType, color: [grays, "6"]},
			{ format: Format.join }
		)
		expect(border.value).to.deep.equal({ border: "1px solid rgb(102, 102, 102)" })
	})
})
