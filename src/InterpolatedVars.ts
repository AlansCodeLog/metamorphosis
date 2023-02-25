import { type MakeOptional, keys } from "@alanscodelog/utils"
import { Base } from "Base.js"
import { getFormatObject } from "private.js"
import { lerp } from "utils.js"
import { Var } from "Var.js"

import { str as strFormat } from "./Format.js"
import { type InterpolationOptions, regexVariable } from "./types.js"

/**
 * For creating ranges of variables (e.g. gray-0, gray-10).
 *
 * This is not very interesting on it's own, but InterpolatedVars tracks it's start/end properties as dependencies, and when they change it gets notified. So we can do things like expose one or two control variable to users while internally using the generated value ranges.
 *
 * ```ts
 * const grays = new InterpolatedVars("gray", Unit.rgb,
 * 	{ start: whiteRgbVar, end: blackRgbVar, steps: 10, format: Format.rgb }
 * )
 * // grays.value = {
 * // 	gray-0: rgb(255, 255, 255)
 * // 	...
 * // 	gray-10: rgb(0, 0, 0)
 * // }
 *
 * // this example can be found in full in the readme
 * ```
 *
 * Basic interpolation utilities for number based properties are included, as well as some utilities for more advanced interpolation techniques. See {@link Utils}.
 *
 * Or you can write completely custom interpolations. A complex interpolator for hsl colors with different variance per property can be found in the example base theme. See {@link https://github.com/AlansCodeLog/metamorphosis/blob/master/src/BaseTheme/createHslColors.ts createHslColors.ts}
 */
// TODO * You can also define other variables the interpolation depends upon, when they change, the change will ripple up the hierarchy.

export class InterpolatedVars<
	TType extends
		Record<string, [any, string]> =
		Record<string, [any, string]>,
	TKeys extends
		keyof TType =
		keyof TType,
	T extends
		{[key in TKeys]: TType[key][0] } =
		{[key in TKeys]: TType[key][0] },
> extends Base<undefined, T[]> {
	type: TType
	value!: Record<string, string>
	// wut
	// eslint-disable-next-line @typescript-eslint/prefer-readonly
	private _ready: boolean = false
	options: {
		start: Var<TType> | number | T
		end: Var<TType> | number | T
		steps: number
		only?: (keyof TType)[] // don't use TKeys we dont' want to modify it's type
		interpolate?: (options: InterpolationOptions<T>) => any
		roundTo: number | false
		// value is always a string because we've already converted it
		// format should NOT be responsible for units
		format: (t: {[key in TKeys]: string }) => string
		/** Customize how the variables are numbered. */
		numbering?: (i: number) => number | string
	} = {} as any
	constructor(
		name: InterpolatedVars<TType, TKeys, T>["name"],
		type: InterpolatedVars<TType, TKeys, T>["type"],
		opts: MakeOptional<InterpolatedVars<TType, TKeys, T>["options"], "steps" | "format" | "roundTo" | "numbering">,
		separator?: string
	) {
		super(name, separator)
		this._checkParams(name, type, opts)

		this.type = type

		this.options = { roundTo: 2, includeZero: false, ...opts, start: undefined, end: undefined } as any
		this.set("start", opts.start)
		this.set("end", opts.end)

		if (!opts.format) this.options.format = strFormat as any
		if (!opts.steps) this.options.steps = (this.options.end as number) - (this.options.start as number)
		this._ready = true
		this._onChange()
	}
	/**
	 * Only the absolute necessary checks are made. The rest is left up to typescript since we can type the parameters pretty strictly.
	 */
	private _checkParams(
		name: InterpolatedVars<TType, TKeys, T>["name"],
		type: InterpolatedVars<TType, TKeys, T>["type"],
		opts: MakeOptional<InterpolatedVars<TType, TKeys, T>["options"], "steps" | "format" | "roundTo" | "numbering">
	): void {
		if (!name.match(regexVariable)) {
			throw new Error(`Invalid variable name: ${name}`)
		}
		if ((typeof opts.start !== "number" || typeof opts.end !== "number") && opts.steps === undefined) {
			throw new Error(`Steps option must be specified if start or end are ${this.constructor.name} instances.`)
		}
		if (typeof opts.start !== "number" && opts.start === opts.end) {
			throw new Error(`Start and end options cannot be the same instance`)
		}
		const typeKeys = Object.keys(type)
		const isSingleVarType = typeKeys.length === 1 && typeKeys[0] === "_"
		if (!isSingleVarType) {
			if (opts.format === undefined) {
				throw new Error(`Must specify formatter for ${name} if value is an object.`)
			}
		}
	}
	convertLimitToType(limit: any): Record<string, any> {
		const res: any = {}
		for (const key of keys(this.type)) {
			if (this.options.only && !this.options.only.includes(key as any)) {continue}
			res[key] = limit
		}

		return res
	}
	getLimit(rawLimit: InterpolatedVars<TType, TKeys>["options"]["start"]): T {
		const optsStart = rawLimit
		return (optsStart instanceof Var
			? optsStart.rawValue
			: typeof optsStart === "object"
			? optsStart
			: this.convertLimitToType(optsStart)) as T
	}
	private _roundIfNeeded(num: number): any {
		if (this.options.roundTo !== false && this.options.roundTo > -1) {
			return (+num.toFixed(this.options.roundTo)).toString()
		}
		return num
	}
	protected override _onChange(): void {
		if (!this._ready) return
		const res: Record<string, string> = {}

		const start = this.getLimit(this.options.start)
		const end = this.getLimit(this.options.end)
		for (let i = 0; i < this.options.steps + 1; i++) {
			const val: Record<string, any> = {}
			for (const key of keys(start)) {
				if (this.options.only && !this.options.only.includes(key as any)) {
					val[key as string] = start[key as keyof T]
					continue
				}

				const percent = i / this.options.steps
				const startValue = start[key as keyof T]
				const endValue = end[key as keyof T]

				if (!this.options.interpolate && (typeof startValue !== "number" || typeof endValue !== "number")) {
					throw new Error(`Cannot interpolate key ${key as string}, it's limits are of type (start: ${startValue} is a ${typeof startValue}, end: ${endValue} is a ${typeof endValue}), please define a custom interpolation function or only interpolate number like properties.`)
				}
				const interpolated = (this.options.interpolate ?? lerp)({ totalSteps: this.options.steps, key: key as keyof T, step: i, percent, start, end, startValue, endValue })

				val[key as any] = this._roundIfNeeded(interpolated)
			}
			const formatObject = getFormatObject(val, this._stringify, this.type)

			res[`${this.name}${this.separator}${this.options.numbering?.(i) ?? i}`] = this.options.format(formatObject as any)
		}
		this.value = res
	}
	set(key: "start" | "end", value: InterpolatedVars<TType, TKeys>["options"]["start"]): void {
		this._checkParams(this.name, this.type, { ...this.options, [key]: value })
		this.removeDependency(this.options[key])
		this.options[key] = value as any // ???
		this.addDependency(value)
		this._onChange()
		this.notify("change", this.name, "key", this.options[key])
	}
	get(i: string): string {
		return this.value[`${this.name}${this.separator}${i}`]
	}
}
