import Color from "colorjs.io"
import colors from "tailwindcss/colors.js"

import { ControlVar } from "./ControlVar.js"
import { InterpolatedVars } from "./InterpolatedVars.js"
import { Theme } from "./Theme.js"
import type { InterpolatedVarsOptions, Interpolator } from "./types.js"
import * as Units from "./Units.js"
import { createNumericalInterpolator, scaleValue, tailwindColorKeyNamer } from "./utils.js"


export const test = Object.fromEntries([["a", "a"]])

// hsl for more saturated color mixing
export const createColorJsIoInterpolator = (format: string = "srgb", space: string = "hsl"): Interpolator<ControlVar<any, Units.Str>> => ({ percent, state, start, end }) => {
	const key = start.css + end.css
	// re/create state if at start or if key switched (due to multiple gradient points)
	if (state.key !== key) {
		const c1 = new Color(start.css)
		const c2 = new Color(end.css)
		state.range = c1.range(c2, { space })
		state.key = key
	}

	const val = state.range(percent)
		.to(format)
		.toString({ format })
		.match(/\((.*?)\)/)[1]
	return { _: val }
}

const colorJsInterpolator = createColorJsIoInterpolator()


export const spacingStart = new ControlVar(Units.rem, 1)
export const twSpacingSteps = [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 3.5, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 18, 20, 24]

export const twSpacingKeys = ["0", "0.5", "1", "1.5", "2", "2.5", "3", "3.5", "4", "5", "6", "7", "8", "9", "10", "11", "12", "14", "16", "20", "24", "28", "32", "36", "40", "44", "48", "52", "56", "60", "64", "72", "80", "96"]

export const spacing = new InterpolatedVars("spacing", Units.rem, [spacingStart], {
	steps: twSpacingSteps,
	interpolator: createNumericalInterpolator(scaleValue),
	// indexes into array of default tailwind spacing steps
	keyName: ({ i, name }) => `${name}-${twSpacingKeys[i]}`,
	roundTo: false,
})

export const tailwindColorOpts = {
	interpolator: colorJsInterpolator,
	keyName: tailwindColorKeyNamer,
	steps: 11,
}
// use Units.str to leverage colorio.js parsing abilities
export const createTailwindColor = (name: string, stops: (string | Units.Str | [number, Units.Str])[], opts: Partial<InterpolatedVarsOptions> = {}): InterpolatedVars<Units.Str> => {
	const controls = []
	for (const stop of stops) {
		const control = new ControlVar(Units.str, Array.isArray(stop) ? stop[1] : (stop))
		controls.push(Array.isArray(stop) ? [stop[0], control] : control)
	}
	return new InterpolatedVars(name, Units.str, controls as any, { ...tailwindColorOpts, ...opts })
}

// for now just copies the tailwind colors
// todo tweak as needed
export const bg = createTailwindColor("color-neutral", [
	...Object.values(colors.neutral),
])

export const ok = createTailwindColor("color-ok", [
	...Object.values(colors.green),
])

export const warning = createTailwindColor("color-warning", [
	...Object.values(colors.yellow),
])

export const danger = createTailwindColor("color-danger", [
	...Object.values(colors.red),
])
export const accent = createTailwindColor("color-accent", [
	...Object.values(colors.blue),
])

export const baseTheme = new Theme({
	spacing,
	bg,
	ok,
	warning,
	danger,
	accent,
})
