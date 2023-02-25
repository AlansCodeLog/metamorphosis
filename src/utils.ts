import type { InterpolationOptions } from "types.js"


export const lerp = ({ percent, startValue, endValue }: Pick<InterpolationOptions<Record<string, number>>, "percent" | "startValue" | "endValue" | "step">): number => startValue + ((endValue - startValue) * percent)


export const createArrayInterpolator =
	(arr: number[]) =>
		({ step, startValue, endValue }: InterpolationOptions<Record<"_", number>>): number => lerp({ step, percent: arr[step], startValue, endValue })

/**
 * Creates an array from a ratio.
 *
 * This must be used with {@see createRatioInterpolator } to work properly.
 */
export const createArrayfromRatio = ({ ratio, length }: { ratio: number, length: 10 }): number[] => {
	const res: number[] = [...Array(length)].reduce((arr: number[], _, i) => {
		arr.push(arr[i] * ratio)
		return arr
	}, [1])
	return res
}

/**
 * For use with arrays from {@see createArrayfromRatio } .
 *
 * Unlike {@see createArrayInterpolator }, only the start value is looked at.
 *
 * It works by doing `arr[step] * startValue` which correctly applies the pre-calculated ratio even if startValue changes.
 */
export const createRatioInterpolator =
	(arr: number[]) =>
		({ step, startValue }: InterpolationOptions<Record<"_", number>>): number => arr[step] * startValue

