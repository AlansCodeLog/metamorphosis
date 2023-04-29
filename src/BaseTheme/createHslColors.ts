import { type DeepPartial, keys, override } from "@alanscodelog/utils"
import { Base } from "Base.js"
import * as Format from "Format.js"
import { InterpolatedVars } from "InterpolatedVars.js"
import type { InterpolationOptions } from "types.js"
import * as Unit from "Unit.js"
import { Var } from "Var.js"
import { VarGroup } from "VarGroup.js"


Base.SEPARATOR = ""

const defaultConfig: ColorConfig = {
	steps: 10,
	luminance: {
		reverse: true,
		stepAmount: 9,
		endVariance: -3,
		endVarianceStep: 3,
		startVariance: 3,
		startVarianceStep: 3,
	},
	saturation: {
		reverse: true,
		stepAmount: 1,
		endVariance: 3,
		endVarianceStep: 3,
		startVariance: 15,
		startVarianceStep: 3,
	},
	hue: {
		reverse: true,
		endVariance: 0.5,
		endVarianceStep: 1,
		startVariance: 0.5,
		startVarianceStep: 1,
		stepAmount: 1,
	},
}

/**
 *
 * Describes how a variable is interpolated.
 *
 * For example, say we have:
 * steps: 10
 * start: 5
 * stepAmount: 1
 * start/endVarianceStep:2
 * start/endVariance: 0.5
 *
 * Our step values will look like this:
 * | 0 1 2 3 4 5 6 7 8 9 |
 *       ^         ^
 * these are the start and end variance steps
 * at which the extra variance amount starts to apply
 *
 * If we had no variance our end values would look like this:
 *
 * | 1 2 3 4 5 6 7 8 9 10 |
 *
 * If we add the variance they would look like this:
 * | -0.5 1 2.5 4 5 6 7 8.5 10 11.5 |
 *
 * If we change a variance to be negative but still less than step amount it "slows down" the rate of change.
 *
 * e.g. if endVariance is -0.5
 *
 * | -0.5 1 2.5 4 5 6 7 7.5 8 8.5|
 *
 * If we made it the same as the step amount but negative (e.g. -1), the end steps would cease to change.
 *
 * | -0.5 1 2.5 4 5 6 7 7 7 7 |
 */

type ColorPropertyConfig = {
	reverse: boolean
	stepAmount: number
	endVariance: number
	endVarianceStep: number
	startVariance: number
	startVarianceStep: number
}
type ColorConfig = {
	steps: number
	luminance: ColorPropertyConfig
	saturation: ColorPropertyConfig
	hue: ColorPropertyConfig
}

/**
 * Interpolates color in a nicer manner, with variance at the start and ends. This allows, things like pushing the ends to be lighter/darker than the middle values, or desaturating dark values, or adding a bit of hue variance to the ends.
 *
 * The default config does a bit of hue variation and reversed saturation (saturates light colors, desaturates dark).
 *
 * Ignores the `end` interpolation option and uses start instead as the middle point from which to branch out.
 *
 * If the hue start value is -1, then hue and saturation variances are disabled, and pure gray is produced.
 *
 * { @see ColorConfig } and { @see ColorPropertyConfig }
 */
export class FancyHslColorInterpolator {
	config: ColorConfig
	constructor(config: DeepPartial<ColorConfig> = {}) {
		this.config = override(defaultConfig, config)
	}
	calculateVariant(
		{
			step,
			totalSteps,
			start: baseValue,
			key,
		}: InterpolationOptions<Unit.HslType>,
		{
			startVariance,
			endVarianceStep,
			endVariance,
			startVarianceStep,
			stepAmount,
			reverse,
		}: ColorPropertyConfig,
	): number {
		step = reverse ? step : totalSteps - step
		let highOffset = ((endVarianceStep - totalSteps) + step)
		let lowOffset = startVarianceStep - step
		highOffset = highOffset > 0 ? highOffset : 0
		lowOffset = lowOffset > 0 ? lowOffset : 0


		if (lowOffset > 0 && highOffset > 0) {
			// eslint-disable-next-line no-console
			console.warn("low hue variance step clashes with high hue variance step")
		}

		const amount = (((totalSteps / 2) - step) * stepAmount) * -1


		const totalAmount = amount - (lowOffset * startVariance) + (highOffset * endVariance)
		const res = baseValue[key] - totalAmount
		// console.log({ step, baseValue, amount, lowOffset, highOffset, lowerVarianceAmount, upperVarianceAmount, res })
		return res
	}
	interpolate(opts: InterpolationOptions<Unit.HslType>): number {
		switch (opts.key) {
			case "h": return opts.start.h >= 0 ? this.calculateVariant(opts, this.config.hue) : 0
			case "s": return opts.start.h >= 0 ? this.calculateVariant(opts, this.config.saturation) : 0
			case "l": return this.calculateVariant(opts, this.config.luminance)
		}
	}
}

// type numberRange = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10"
export const createHslColors = <T extends Record<string, number> = {
	/* eslint-disable @typescript-eslint/naming-convention */
	Red: 0
	Pink: 339
	Purple: 272
	Blue: 211
	Cyan: 188
	Green: 100
	Yellow: 39
	Orange: 24
	Gray: -1
	/* eslint-enable @typescript-eslint/naming-convention */
}, TName extends string = "Color">(
	name: TName = "Color" as any as TName,
	start: Unit.HslType = { h: 0, s: 70, l: 50 },
	hues: T = {
		Red: 0,
		Pink: 339,
		Purple: 272,
		Blue: 211,
		Cyan: 188,
		Green: 100,
		Yellow: 39,
		Orange: 24,
		Gray: -1,
	} as any as T,
	config: DeepPartial<ColorConfig> = {},
	separator: string = "-"
): {
	controls: VarGroup<Record<string, Var<typeof Unit.hsl>>>
	colors: Record<`${Extract<keyof T, string>}`, InterpolatedVars<typeof Unit.hsl>>
	fancyInterpolator: FancyHslColorInterpolator
} => {
	const fancyInterpolator = new FancyHslColorInterpolator(config)

	const colorVars: Record<string, InterpolatedVars<typeof Unit.hsl>> = {}
	const controlVars: Record<string, Var<typeof Unit.hsl>> = {}

	for (const hueKey of keys(hues)) {
		const colorStart = new Var(
			`${name}${separator}${hueKey}`,
			Unit.hsl,
			{ ...start, h: hues[hueKey] },
			{
				format: Format.hsl,
			},
			separator
		)
		controlVars[hueKey] = colorStart
		colorVars[hueKey] = new InterpolatedVars(`${name}${Base.SEPARATOR}${hueKey}`, Unit.hsl, {
			start: colorStart,
			end: { h: 0, s: 0, l: 0 },
			steps: 10,
			interpolate: opts => fancyInterpolator.interpolate(opts),
			format: Format.hsl,

		}, separator)
	}
	return { controls: new VarGroup(name, controlVars, ""), colors: colorVars, fancyInterpolator }
}
