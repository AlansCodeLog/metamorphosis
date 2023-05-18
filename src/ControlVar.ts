import type { MakePrimitive } from "@alanscodelog/utils"

import { Base } from "./Base.js"


/**
 * Creates a control variable.
 *
 * ```ts
 * const controlVar = new ControlVar(Units.rgb, { r: 0, g: 0, b: 0 })
 * ```
 *
 * The type of the control is taken from the type of the unit formatting function.
 *
 * All control variables are objects internally, but for ease of use, control variables can also be defined like:
 *
 * ```ts
 * const controlVar = new ControlVar(Units.num, 0)
 * // same as
 * const controlVar = new ControlVar(Units.num, { _: 0 })
 * ```
 *
 * To change their value, the `set` method must be used to ensure that any other variables depending on it are updated.
 */
export class ControlVar<
	TVal extends
		Record<string, any> | string | number | boolean =
		Record<string, any> | string | number | boolean,
	TUnit extends
		TVal extends Record<string, any> ? TVal : Record<"_", MakePrimitive<TVal>>=
		TVal extends Record<string, any> ? TVal : Record<"_", MakePrimitive<TVal>>,
> extends Base {
	unit: (value: TUnit) => string
	value!: TUnit
	css: string = ""

	constructor(
		unit: ControlVar<TVal, TUnit>["unit"],
		value: TVal,

	) {
		super()
		this.unit = unit
		this.set(value as any)
	}
	set(value: MakePrimitive<TVal> | TUnit): void {
		this.value = (["number", "string", "boolean"].includes(typeof value) ? { _: value } : value) as TUnit
		this.notify()
	}
	protected notify(): void {
		this.recompute()
		this._notify()
	}
	protected recompute(): void {
		this.css = this.unit(this.value)
	}
}
