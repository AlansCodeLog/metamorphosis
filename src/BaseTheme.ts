import Color from "colorjs.io"
import colors from "tailwindcss/colors.js"

import { ControlVar } from "./ControlVar.js"
import { InterpolatedVars } from "./InterpolatedVars.js"
import { Theme } from "./Theme.js"
import type { InterpolatedVarsOptions, Interpolator } from "./types.js"
import * as Units from "./Units.js"
import { tailwindColorKeyNamer } from "./utils.js"


export const test = Object.fromEntries([["a", "a"]])

// hsl for more saturated color mixing
// todo update and move to oklch like tailwind?
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
	return { _: `rgb(${val})` }
}

const colorJsInterpolator = createColorJsIoInterpolator()


export const spacing = new ControlVar(Units.rem, {	_: 0.25 })

export const tailwindColorOpts: Partial<InterpolatedVarsOptions<ControlVar<any, any>>> = {
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

export const background = new ControlVar(Units.str, "99% 99% 99%")

export const foreground = new ControlVar(Units.str, "1% 1% 1%")

export const baseTheme = new Theme({
	"number-spacing": spacing,
	bg,
	"color-bg": background,
	"color-fg": foreground,
	ok,
	warning,
	danger,
	accent,
})
