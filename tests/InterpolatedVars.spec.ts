/* eslint-disable import/no-namespace */
import { catchError, testName } from "@alanscodelog/utils"
import * as Format from "Format.js"
import { InterpolatedVars } from "InterpolatedVars.js"
import * as Unit from "Unit.js"
import { Var } from "Var.js"
import { describe, expect, it } from "vitest"


describe(testName(), () => {
	it("simple number vars interpolation", () => {
		const borderStart = new Var(
			"border-start",
			Unit.px,
			0
		)
		const borderVars = new InterpolatedVars(
			"border",
			Unit.px,
			{ start: borderStart, end: 10, steps: 5 }
		)
		expect(borderVars.value).to.deep.equal({
			"border-0": "0px",
			"border-1": "2px",
			"border-2": "4px",
			"border-3": "6px",
			"border-4": "8px",
			"border-5": "10px",
		})
	})
	it("complex number vars interpolation", () => {
		const colorStart = new Var(
			"color-start",
			Unit.rgb,
			{ r: 0, g: 0, b: 0 },
			{ format: Format.rgb }
		)
		const colorVars = new InterpolatedVars(
			"color",
			Unit.rgb,
			{ start: colorStart, end: 10, steps: 5, format: Format.rgb }
		)
		expect(colorVars.value).to.deep.equal({
			"color-0": "rgb(0, 0, 0)",
			"color-1": "rgb(2, 2, 2)",
			"color-2": "rgb(4, 4, 4)",
			"color-3": "rgb(6, 6, 6)",
			"color-4": "rgb(8, 8, 8)",
			"color-5": "rgb(10, 10, 10)",
		})
	})
	it("only option", () => {
		const vars = new InterpolatedVars(
			"var",
			{ a: Unit._str, b: Unit._num },
			{
				start: { a: "a", b: 0 },
				end: 10,
				steps: 5,
				format: Format.join,
				only: ["b"],
			}
		)
		expect(vars.value).to.deep.equal({
			"var-0": "a 0",
			"var-1": "a 2",
			"var-2": "a 4",
			"var-3": "a 6",
			"var-4": "a 8",
			"var-5": "a 10",
		})
	})
	it("errors on non number values", () => {
		expect(catchError(() => {
			const vars = new InterpolatedVars(
				"var",
				{ a: Unit._str, b: Unit._num },
				{
					start: { a: "a", b: 0 },
					end: 10,
					steps: 5,
					format: Format.join,
				}
			)
		}).message).to.contain("custom interpolation")
		expect(() => {
			const vars = new InterpolatedVars(
				"var",
				{ a: Unit._str, b: Unit._num },
				{
					start: { a: "a", b: 0 },
					end: 10,
					steps: 5,
					format: Format.join,
					only: ["b"],
				}
			)
		}).to.not.throw()
	})
})
