import { keys, setReadOnly } from "@alanscodelog/utils"
import { Base } from "Base.js"
import { getFormatObject } from "private.js"

import { str as strFormat } from "./Format.js"
import type { ValueType } from "./types.js"

/**
 * Creates a css variable.
 *
 * ```ts
 * const px1 = new Var("px-1", Unit.px, 1)
 *
 * // px1.value = { "px-1": "1px" }
 * ```
 *
 * {@link Unit `Unit`} is a namespace with some pre configured unit types. In this case `Unit.px` is `{_: [0,"px"]}` which is a special notation to specify the variable type and suffix.
 *
 * `_` is a special key which means the variable is a primitive and has no properties. `"px"` is the suffix that will be added when formatting the value to a string. `0` is used to indicate it's a number type (any number could be used).
 *
 * ## Multiple Properties
 *
 * A variable can consist of any number of properties. When using more than one property, names must be specified for the properties. For example, `Unit.rgb` describes a variable with 3 properties without any suffixes.
 *
 * ```ts
 * const black = new Var(
 * 	"black",
 * 	Unit.rgb, // {r: [0,""], g: [0,""], b: [0,""]}
 * 	{r: 0, g:0, b:0},
 * 	{format: Format.rgb} // tells us how to format the properties
 * )
 *
 * // black.value = {"black": "rgb(0, 0, 0)"}
 *
 * ```
 * Multi-property variables require a formatter. Formatters for all units in {@link Unit `Unit`} are included, { @see Format }.
 *
 * "Sub-units" (the `[0, ""]` part) such as `_px` are also available in {@link Unit `Unit`} for more readable creation of custom units.
 *
 * ## Variables inside Variables
 *
 * Variables values don't need to be primitives, they can be variables themselves.
 *
 * ```ts
 * 	const px1 = new Var("px-1", Unit.px, 1)
 * 	const px2 = new Var("px-2", Unit.px, px1)
 * ```
 *
 * They can also refer to interpolated variables. Here we are referring to the interpolated "pixels-5".
 * ```ts
 * 	const pixels = new InterpolatedVar("pixels", ...)
 * 	const px = new Var("px", Unit.px, [pixels, "5"])
 * ```
 *
 * Variables with multiple properties can also consist of other variables. For example, their is a border unit available and it can be used like so to create a border variable.
 *
 * ```ts
 *
 * // create the variables of the corresponding types needed
 * const borderWidth = new Var(...) // _px
 * const borderType = new Var(...) // _borderType (this is a specially typed _str type)
 * const colorVar = new Var(...) // _rgb
 *
 * const border = new Var(
 * 	"border",
 * 	Unit.border, // { w: Unit._px,	type: Unit._borderType,	color: Unit._rgb }
 * 	{ w: borderWidth, type: borderType, color: colorVar },
 * 	{ format: Format.join }
 * )
 * ```
 *
 * Behind the scenes units like these should be created like so to get correct typing information:
 *
 * ```
 * const rgb = { r: Unit._num, g: Unit._num, b: Unit._num }
 * const _rgb = [rgb, ""] as [typeof rgb, ""]
 * ```
 */

export class Var<
	TType extends
		Record<string, [any, string]> =
		Record<string, [any, string]>,
	TKeys extends
		keyof TType =
		keyof TType,
	T extends
		{[key in TKeys]: TType[key][0] } =
		{[key in TKeys]: TType[key][0] },
	TValue extends
		ValueType<TType, T> =
		ValueType<TType, T>,
> extends Base<TValue> {
	type: TType
	value!: Record<string, string>
	// value is always a string because we've already converted it
	// format should NOT be responsible for units
	options: {
		format: (t: {[key in TKeys]: string }) => string
		/** Whether to hide the variable in the output of {@see Theme["css"]} */
		hide: boolean
	}
	constructor(
		name: Var<TType>["name"],
		type: Var<TType>["type"],
		// we don't want the type of TValue to change based on the parameter
		value: ValueType<TType, T>,
		opts: Partial<Var<TType, TKeys>["options"]> = {},
		separator?: string
	) {
		super(name, separator)
		this._checkParams(name, type, value, opts)

		this.options = { hide: false, ...opts as any }
		if (!opts.format) this.options.format = strFormat as any
		this.type = type

		this.set(value)
	}
	/**
	 * Only the absolute necessary checks are made. The rest is left up to typescript since we can type the parameters pretty strictly.
	 */
	private _checkParams(
		name: Var<TType>["name"],
		type: Var<TType>["type"],
		value: ValueType<TType, T>,
		opts: Partial<Var<TType, TKeys>["options"]>
	): void {
		const typeKeys = Object.keys(type)
		if (opts.format === undefined && typeof value === "object" && (typeKeys.length > 1 || typeKeys[0] !== "_")) {
			throw new Error(`Must specify formatter for ${name} if value is an object.`)
		}

		if (value instanceof Var && value.name === name) {
			throw new Error("Value Var instance cannot have the same name as this instance.")
		}
	}
	private _getOnlyValue(value: Record<string, string>): string {
		const key = keys(value)[0]
		return value[key]
	}
	protected override _onChange(): void {
		if (this.rawValue instanceof Var) {
			this.value = { [this.name]: this._getOnlyValue(this.rawValue.value) }
			return
		}
		const value = this.options.format(getFormatObject(this.rawValue, this._stringify, this.type) as T)
		this.value = { [this.name]: value }
	}
	set(value: ValueType<TType, T>): void {
		this._checkParams(this.name, this.type, value, this.options)
		this.removeDependency(this.rawValue)
		setReadOnly(this, "rawValue", typeof value === "object" ? value : { _: value } as any)
		this.addDependency(value)
		this.notify("change", this.name, "rawValue", this.rawValue)
	}
}
