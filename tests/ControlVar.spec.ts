import { describe, expect, it } from "vitest"

import { ControlVar } from "../src/ControlVar.js"
import { Units } from "../src/index.js"


it("basic set with full object works", () => {
	const white = new ControlVar(Units.rgb, { r: 255, g: 255, b: 255 })

	expect(white.value).to.deep.equal({ r: 255, g: 255, b: 255 })
	expect(white.css).to.deep.equal(`rgb(255, 255, 255)`)

	white.set({ r: 0, g: 0, b: 0 })
	expect(white.value).to.deep.equal({ r: 0, g: 0, b: 0 })
	expect(white.css).to.deep.equal(`rgb(0, 0, 0)`)
})
it("primitives can be used as a value and are set ar {_: val}", () => {
	const padding = new ControlVar(Units.px, 0)
	padding.set(1)
	expect(padding.value).to.deep.equal({ _: 1 })
})
it("alpha units can be used without error", () => {
	expect(new ControlVar(Units.rgb, { r: 255, g: 255, b: 255, a: 1 }).css).to.equal("rgb(255, 255, 255 / 1)")
})
