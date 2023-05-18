import { testName } from "@alanscodelog/utils"
import { describe, expect, it, vi } from "vitest"

import { ControlVar } from "../src/ControlVar.js"
import { Units } from "../src/index.js"
import { Theme } from "../src/Theme.js"


describe(testName(), () => {
	it("theme on change works", () => {
		const theme = new Theme({})
		const onChange = vi.fn(() => { })

		theme.on("change", onChange)
		theme.set("gray", new ControlVar(Units.num, 0))
		expect(onChange.mock.calls.length).to.equal(1)
	})
	// todo more tests
})
