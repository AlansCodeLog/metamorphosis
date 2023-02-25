import { testName } from "@alanscodelog/utils"
import { Format, InterpolatedVars, Theme, Unit, Var, VarGroup } from "index.js"
import { describe, it } from "vitest"


describe(testName(), () => {
	it("works 1", () => {
		// create the base color variables
		const white = new Var("white", Unit.rgb, { r: 255, g: 255, b: 255 }, {
			format: Format.rgb,
		})
		const black = new Var("black", Unit.rgb, { r: 0, g: 0, b: 0 }, {
			format: Format.rgb,
		})

		// create interpolated variables based on them
		const grays = new InterpolatedVars("gray", Unit.rgb, {
			start: white,
			end: black,
			steps: 10,
			format: Format.rgb,
		})

		// further group/select certain variables
		const colors = new VarGroup("color", {
			text: [grays, "8"],
		})

		// create a theme
		const theme = new Theme("mainTheme", {
			grays,
			colors,
		})

		// view theme
		// by default dependencies are hidden, white and black won't show
		console.log(theme.css())
		// :root {
		//		gray-0: rgb(255, 255, 255);
		//		...
		//		gray-10: rgb(0, 0, 0);
		//		color-text: rgb(51, 51, 51);
		// }

		// change a control variable
		white.set({ r: 200, g: 200, b: 200 })

		// all variables that depend on it update
		console.log(theme.css())
		// :root {
		//		gray-0: rgb(200, 200, 200);
		//		...
		//		gray-10: rgb(0, 0, 0);
		//		color-text: rgb(40, 40, 40);
		// }

		// attach or detach a theme from an element, if none given, attaches to document.documentElement
		// attaching will set the css variables on the element and keep them updated
		theme.attach(/* el */)
		theme.detach(/* el */)
	})
})
