import type { InterpolatedVars } from "InterpolatedVars.js"

import type { Var } from "./Var.js"


type SingularVarType = Record<"_", any>
type Primitive = string | boolean | number
type ValType = [type: any, suffix: string]
export type TypeToValue<TType extends Record<string, ValType>> = {[key in keyof TType]: TType[key][0] }


type Interpolated<T extends Record<string, [any, string]> = Record<string, [any, string]> > = [variable: InterpolatedVars<T, any, any>, index: string]

export type ValueType<TType extends Record<string, ValType>, T, TAllowPrimitive extends boolean = true> =
	TType extends SingularVarType
		// if e.g. TType is `{_: [0, "px"]}`, allow instance of Var with that type, a raw `{_: 1}`, the interpolated notation `[Var, index] or `1` if TAllowPrimitive is true
		? Interpolated<TType> | Var<TType> | T | (TAllowPrimitive extends true ? T[keyof T] : never)
		// else e.g. TType is`{custom: [0, "px"], keys: ["", ""]}`
		: TType extends Record<string, any>
			? {
				// for each value
				[key in keyof TType]:
				// allow it's type
				TType[key][0]
				// or allow a Var of that type
				| (
					// the first key is also allowed to be typecast as not a primitive for advanced type checking
					// e.g. `{color: [Unit.rgb, ""]}`
					// if the key does not extend a primitive, we allow the strictly typed Unit.rgb Var
					TType[key][0] extends Primitive
						? Var<{ _: TType[key] }> | Interpolated<{ _: TType[key] }>
						: Var<TType[key][0]> | Interpolated<TType[key][0]>
				)
			}
			: never
// : Var<TType> | T


// https://www.w3.org/TR/CSS22/syndata.html#value-def-identifier
// this should be enough
// https://github.com/tc39/proposal-regexp-unicode-property-escapes
// match any letters, and non-ascii letter using unicode escapes, or any escaped character
export const regexVariable = /^([a-zA-Z0-9\p{Letter}_\\-]|\\.)+$/u


export type Listener<T> = (name: string, key: string, value: T) => void


export type InterpolationOptions<T extends Record<string, any>> = {
	key: keyof T
	step: number
	totalSteps: number
	percent: number
	start: T
	end: T
	startValue: T[keyof T]
	endValue: T[keyof T]
}
