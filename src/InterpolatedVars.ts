import { isBlank } from "@alanscodelog/utils/isBlank"

import { Base } from "./Base.js"
import type { ControlVar } from "./ControlVar.js"
import { getTotalSteps } from "./internal.js"
import type { InterpolatedVarsOptions, StopEntry, Value } from "./types.js"
import { defaultKeyNamer, lerp } from "./utils.js"


const getStepPercent = (percent: number, startPercent: number, endPercent: number): number => {
	// the percentage into the stop
	let stopPercent = (percent - startPercent)
	let stopPercentTotal = (endPercent - startPercent)
	// if the first stop percentage > 0, this still be < 0, clamp to 0%
	if (stopPercent < 0) stopPercent = 0
	// if the last stop percentage < 1
	// stopPercentageTotal will be 0 causing division by 0, clamp to 100%
	if (stopPercentTotal === 0) {
		stopPercent = 1
		stopPercentTotal = 1
	}

	return stopPercent / stopPercentTotal
}

/**
 * Creates a list of interpolated values from a given list of {@link ControlVar}s.
 *
 * ```ts
 *
 * const v1 = new ControlVar(Units.num, 0)
 * const v2 = new ControlVar(Units.num, 100)
 *
 * const interpolated = new InterpolatedVars("spacing", Units.px, [v1, v2])
 * // interpolates from 0-100
 *
 * v1.set(50) // interpolated will now update to interpolate from 50-100
 * ```
 *
 * It can be passed multiple stops.
 * ```ts
 * const interpolated = new InterpolatedVars("spacing", Units.px, [v1, v2, v3])
 * ```
 *
 * ... or stops with positions (otherwise they are evenly spaced).
 *
 * ```ts
 *	// positions should be in a 0-1 percentage range
 * const interpolated = new InterpolatedVars("spacing", Units.px, [[0, v1], [0.2, v2], [1, v3]])
 * ```
 *
 *
 * You can change interpolation control variables and any options using `set`:
 *
 * ```ts
 * interpolated.set("values", [vOther1, vOther2, vOther3])
 * interpolated.set("options", {steps: 20})
 * ```
 */

export class InterpolatedVars<
	TUnit extends Record<string, any> = Record<string, any>,
> extends Base {
	name: string

	unit: (value: TUnit) => string

	values!: Value<TUnit>

	ready: boolean = false

	value: Record<string, any>[] = []

	interpolated: Record<string, string> = {}

	options: InterpolatedVarsOptions<ControlVar<any, TUnit>> = {
		roundTo: 3,
		exclude: [],
		keyLimit: 10,
		keyName: defaultKeyNamer,
		interpolator: lerp as any,
		separator: "-",
		steps: 10,
	}

	constructor(
		name: string,
		unit: (value: TUnit) => string,
		values: Value<TUnit>,
		options: Partial<InterpolatedVarsOptions<ControlVar<any, TUnit>>> = {}
	) {
		super()
		if (isBlank(name)) throw new Error("Name cannot be blank.")

		this.name = name
		this.unit = unit
		this.set(values)
		this.setOpts(options)
		this.ready = true
		this.notify()
	}

	setOpts(value: Partial<InterpolatedVarsOptions<ControlVar<any, TUnit>>>): void {
		this.options = { ...this.options, ...value }
		if (this.ready) { this.notify() }
	}

	set(value: Value<TUnit>): void {
		// :/ https://github.com/microsoft/TypeScript/issues/50652
		type Stop = StopEntry<TUnit>

		const hasStops = Array.isArray(value[0])
		if (this.ready) {
			for (const val of this.values) {
				const v = hasStops ? (val as Stop)[1] : val as ControlVar<any, TUnit>
				v?.removeDep(this)
			}
		}
		if (hasStops && (value as Stop[]).find(entry => entry[0] > 1) !== undefined) {
			throw new Error("Stop Entry percentage must be expressed in a value from 0 to 1.")
		}

		this.values = hasStops
			? ([...value] as Stop[]).sort((a, b) => a[0] - b[0])
			: value
		for (const val of this.values) {
			const v = hasStops ? (val as Stop)[1] : val as ControlVar<any, TUnit>
			v.addDep(this)
		}

		if (this.ready) { this.notify() }
	}

	protected notify(): void {
		this.recompute()
		this._notify()
	}

	protected recompute(): void {
		const valRes: Record<string, any>[] = []
		const interpolatedRes: Record<string, string> = {}
		const steps = this.options.steps
		const totalSteps = getTotalSteps(steps)
		const { values, name } = this
		const hasStops = Array.isArray(values[0])
		const lastStopIndex = values.length - 1
		const nonStopStepPercent = lastStopIndex === 0 ? 0 : 1 / lastStopIndex // avoid division by 0
		const state = {}

		let stopIndex = -1
		let nextStopIndex = -1
		let startPercent = -1
		let endPercent = -1
		for (let i = 0; i < totalSteps; i++) {
			let percent = Array.isArray(steps)
				? steps[i]
				: (i) / (steps - 1)

			let startVal: ControlVar<any, TUnit>, endVal: ControlVar<any, TUnit>

			if (hasStops) {
				while (
					(stopIndex < 0 ||
					endPercent < percent) &&
					stopIndex < values.length - 1
				) {
					stopIndex++
					startPercent = (values[stopIndex] as any[])[0]
					nextStopIndex = Math.min(stopIndex + 1, lastStopIndex)
					endPercent = (values[nextStopIndex] as StopEntry<TUnit>)[0]
				}

				startVal = (values[stopIndex] as StopEntry<TUnit>)[1]
				endVal = (values[nextStopIndex] as StopEntry<TUnit>)[1]
				percent = getStepPercent(percent, startPercent, endPercent)
			} else {
				const startValIndex = Math.floor(percent * (lastStopIndex))
				const endValIndex = Math.min(startValIndex + 1, lastStopIndex)
				startPercent = startValIndex * nonStopStepPercent
				endPercent = endValIndex * nonStopStepPercent
				percent = getStepPercent(percent, startPercent, endPercent)
				startVal = values[startValIndex] as ControlVar<any, TUnit>
				endVal = values[endValIndex] as ControlVar<any, TUnit>
			}

			const keyName = this.options.keyName({ i, steps, totalSteps, name: this.name, keyLimit: this.options.keyLimit, separator: this.options.separator })

			const val: Record<string, any> = this.options.interpolator({
				start: startVal,
				end: endVal,
				name,
				percent,
				state,
				step: i,
				keyName,
				totalSteps,
				steps,
				exclude: this.options.exclude,
				roundTo: this.options.roundTo,
			})
			valRes.push(val)
			interpolatedRes[keyName] = this.unit(val as TUnit)
		}
		this.value = valRes
		this.interpolated = interpolatedRes
	}
}
