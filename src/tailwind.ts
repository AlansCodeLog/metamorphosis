import { keys } from "@alanscodelog/utils/retypes"
import { castType } from "@alanscodelog/utils/utils"
import plugin from "tailwindcss/plugin.js"
import type { PluginAPI } from "tailwindcss/types/config.js"

import { ControlVar } from "./ControlVar.js"
import { InterpolatedVars } from "./InterpolatedVars.js"
import type { Theme } from "./Theme.js"
import { escapeKey } from "./utils.js"


const removePrefix = (str: string, name: string, sep: string): string => str.replace(`${name}${sep}`, "")

/** Ensures name is split by the first separator only. */
const splitName = (str: string, sep: string): string[] => {
	const sepIndex = str.indexOf(sep)
	if (sepIndex === -1) return [str]
	else {
		const type = str.slice(0, sepIndex)
		const name = str.slice(sepIndex + 1)
		return [type, name]
	}
}
/**
 * Creates a Tailwind CSS plugin that takes a theme and extends the config with it's variables and registers the variables as global css variables.
 *
 * The idea is the global css variables contain the values and the tailwind config variables just point to them using `var(--{theme-var-name})`, this way they can easily be dynamically overriden by the library.
 *
 * It expects var values should be formatted to their raw components (e.g. `0, 0 ,0` instead of `rgb(0, 0, 0)`) for maximum compatibility with tailwind. See below.
 *
 * Vars should also have a naming scheme like `{tailwindType}-{name}` (e.g. `colors-red`), or for top level variables `{tailwindType}` (e.g. `spacing`).
 *
 * For InterpolatedVars, `{name}` would be the instance's name. To name ControlVars, they should be added to the theme like so:
 *
 * ```
 * new Theme({"color-fancy-red": new ControlVar(...) })
 * ```
 *
 * Since it's a bit weird to have variables named `--colors-red-000`, there is a `twTypeMap` option that allows you to map an extracted type to a tailwind config key. For example, you can pass `{color:"colors"}` to be able to call variables `color-*`.
 *
 *
 * To force a variable to be registered at the "top" level, use the topLevel option:
 * ```ts
 *
 * createTailwindPlugin(baseTheme, {
 *		topLevel: ["color-neutral"],
 *		twTypeMap: { color: "colors" },
 * })
 * // will extend the config with:
 * {
 * 	colors: {
 * 		// nameless keys of color-neutral
 * 		"50": "var(--color-neutral-50)",
 * 		"100" : "var(--color-neutral-100)",
 * 		...
 * 	}
 * }
 * ```
 *
 * By default, `var(--${escapeKey(key)})` is used as the value on the tailwind variables. You can change this by using the `convertValueMap` option. **This should always be done for colors, otherwise tailwind's alpha syntax won't work. Aditionally as mentioned before, this requires variables to format to their raw components (e.g. `0, 0 ,0` instead of `rgb(0, 0, 0)`).**
 *
 * ```ts
 * import { escapeKey, createTailwindPlugin } from "metamorphosis/tailwind"
 * createTailwindPlugin(baseTheme, {
 * 	convertValueMap: {
 * 		color: (key, _entry, _val) => `rgb(var(--${escapeKey(key)}) / <alpha-value>)`,
 * 	}
 *  })
 * ```
 *
 *
 * You can also exclude variables from the css or from the tailwind config by using `excludeCss` and `excludeTw`.
 *
 * Default versions of interpolated variables can be specified with the defaultsMap:
 *
 * ```ts
 *
 * createTailwindPlugin(baseTheme, {
 * 	defaultsMap: {
 * 		"color-neutral": "50",
 * 	   "color-red": "500"
 * 	},
 * })
 * ```
 *
 */
 
export const createTailwindPlugin = (
	themeInstance: Theme<any>,
	{
		topLevel = [],
		twTypeMap = {},
		convertValueMap = {},
		separator = "-",
		excludeCss = [],
		excludeTw = [],
		defaultsMap = {},
	}: {
		defaultsMap?: Record<string, string>
		topLevel?: string[]
		twTypeMap?: Record<string, string>
		convertValueMap?: Record<string, (key: string, value: string, entry: InterpolatedVars | ControlVar) => string>
		separator?: string
		excludeCss?: string[]
		excludeTw?: string[]
	} = {}
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
) => {
	const extendedConfig: Record<string, string | Record<string, string>> = {}

	const defaultConvert = (key: string): string => `var(--${escapeKey(key, separator)})`

	for (const [themeKeyName, entry] of Object.entries(themeInstance.value)) {
		castType<Theme["value"][keyof Theme["value"]]>(entry)
		// const entry = themeInstance.value[key]
		// console.log(entry)
		if (entry instanceof InterpolatedVars) {
			if (excludeTw.includes(entry.name)) continue
			const [type, twName] = splitName(entry.name, separator)
			const twType = twTypeMap[type] ?? type
			const isTopLevel = !twName || topLevel.includes(entry.name)

			for (const key of keys(entry.interpolated)) {
				const twKey = removePrefix(key, entry.name, entry.options.separator)
				extendedConfig[twType] ??= {} as Record<string, string>
				const twEntry: any = extendedConfig[twType]
				if (isTopLevel) {
					twEntry[twKey] = convertValueMap[type]?.(key, entry.interpolated[key], entry) ?? defaultConvert(key)
				}
				if (twName) {
					twEntry[twName] ??= {}
					twEntry[twName][twKey] = convertValueMap[type]?.(key, entry.interpolated[key], entry) ?? defaultConvert(key)
				}
			}
			if (defaultsMap[entry.name]) {
				const twKey = defaultsMap[entry.name]
				extendedConfig[twType] ??= {} as Record<string, string> // just in case
				const twEntry: any = extendedConfig[twType]
				const key = entry.name + entry.options.separator + twKey
				if (isTopLevel) {
					twEntry[""] = convertValueMap[type]?.(key, entry.interpolated[key], entry) ?? defaultConvert(twKey)
				}
				if (twName) {
					twEntry[twName] ??= {}
					twEntry[twName].DEFAULT = convertValueMap[type]?.(key, entry.interpolated[key], entry) ?? defaultConvert(twKey)
				}
			}
		} else if (entry instanceof ControlVar) {
			if (excludeTw.includes(themeKeyName)) continue
			const [type, twName] = splitName(themeKeyName, separator)
			const twType = twTypeMap[type] ?? type
			extendedConfig[twType] ??= {} as Record<string, string>
			const twEntry: any = extendedConfig[twType]
			if (twName === undefined) throw new Error(`theme key ${themeKeyName} must be named like {tailwindType}-{name}`)
			twEntry[twName] = convertValueMap[type]?.(themeKeyName, entry.css, entry) ?? entry.css
		}
	}
	const pluginFunc = ({ addBase }: PluginAPI): void => {
		const res: Record<string, string> = {}
		for (const [key, val] of Object.entries(themeInstance.value)) {
			if (excludeCss.includes((val as any).name ?? key)) continue
			// @ts-expect-error using protected method
			themeInstance._generateCss(res, key, separator, val)
		}
		addBase({
			":root": themeInstance.css,
		})
	}
	return plugin(pluginFunc, { theme: { extend: extendedConfig } })
}

