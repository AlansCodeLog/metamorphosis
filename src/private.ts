import { type AnyFunction, isArray, keys } from "@alanscodelog/utils"
import type { InterpolatedVars } from "InterpolatedVars.js"
import { Var } from "Var.js"

/** @internal */
export const getFormatObject = (value: Record<string, any>, stringify: AnyFunction, types: Record<string, [any, string]>): Record<string, string> => {
	const res: Record<string, string> = {}
	if (isArray(value)) {
		return { _: (value[0] as InterpolatedVars).get(value[1]) }
	}
	for (const [key, val] of Object.entries(value)) {
		res[key] = val instanceof Var
			? val.value[keys(val.value)[0]]
			: isArray(val)
			? (val[0] as InterpolatedVars).get(val[1])
			: stringify(val, types[key])
	}
	return res
}

