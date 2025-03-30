import { castType } from "@alanscodelog/utils/castType.js"
import { keys } from "@alanscodelog/utils/keys.js"

import { ControlVar } from "./ControlVar.js"
import { InterpolatedVars } from "./InterpolatedVars.js"
import type { Theme } from "./Theme.js"
import { escapeKey } from "./utils.js"

// const removePrefix = (str: string, name: string, sep: string): string => str.replace(`${name}${sep}`, "")

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
const defaultTailwindOpts: Required<TailwindPluginOptions> = {
	twTypeMap: {},
	convertValueMap: {},
	separator: "-",
	excludeTw: [],
	defaultsMap: {},
	topLevel: []
}

/**
 * Creates a static Tailwind V4 CSS config using the given theme. This ensures things look ok (at least with the static defaults) before the js is loaded that sets the final theme variables.
 *
 * Vars should have a naming scheme like `{tailwindType}-{name}` (e.g. `colors-red`).
 *
 * For InterpolatedVars, `{name}` would be the instance's name. To name ControlVars, they should be added to the theme like so:
 *
 * ```
 * new Theme({"color-fancy-red": new ControlVar(...) })
 * ```
 *
 * You can make a ControlVar top level so it's not prefixed with the type (e.g. `color`) by adding it to the topLevel option:
 *
 * ```
 * new Theme({"number-spacing": new ControlVar(...) })
 *
 * createTailwindPlugin(baseTheme, {
 * 	topLevel: ["number-spacing"] // will output `--spacing: ...`
 * })
 * ```
 *
 * Since it's a bit weird to have variables named `--colors-red-000`, there is a `twTypeMap` option that allows you to map an extracted type to a tailwind config key. For example, you can pass `{color:"colors"}` to be able to call variables `color-*`.
 *
 * By default the following function is used as the value on the tailwind variables:
 *
 * ```
 * (key, value, _entry): string => `--${escapeKey(key, "-")}: ${value};`
 * ```
 *
 * You can change this per type by using the `convertValueMap` option.
 *
 * ```ts
 * import { escapeKey, createTailwindPlugin } from "metamorphosis/tailwind.js"
 * createTailwindPlugin(baseTheme, {
 * 	convertValueMap: {
 * 		color: (key, value, entry) => `...`,
 * 	}
 *  })
 * ```
 *
 *
 * You can also exclude variables from the tailwind config by setting `excludeTw`.
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
 */
 
export function themeAsTailwindCss(
	themeInstance: Theme<any>,
	options: TailwindPluginOptions = {}
): string {
	const opts = {
		...defaultTailwindOpts,
		...options
	}
	const {
		twTypeMap,
		convertValueMap,
		separator,
		excludeTw,
		defaultsMap,
		topLevel,
	} = opts

	const defaultConvert = (key: string, value: string, _entry: InterpolatedVars | ControlVar): string => `--${escapeKey(key, separator)}: ${value};`

	const text: string[] = []
	text.push(`@theme {`)

	const config: Record<string, string | Record<string, string>> = {}

	for (const [themeKeyName, entry] of Object.entries(themeInstance.value)) {
		castType<Theme["value"][keyof Theme["value"]]>(entry)
		if (entry instanceof InterpolatedVars) {
			if (excludeTw.includes(entry.name)) continue
			const [type] = splitName(entry.name, separator)
			const twType = twTypeMap[type] ?? type

			for (const key of keys(entry.interpolated)) {
				config[twType] ??= {} as Record<string, string>
				const v = convertValueMap[type]?.(key, entry.interpolated[key], entry) ?? defaultConvert(key, entry.interpolated[key], entry)
				text.push(`\t${v}`)
			}
			if (defaultsMap[entry.name]) {
				const twKey = defaultsMap[entry.name]
				config[twType] ??= {} as Record<string, string> // just in case
				const key = entry.name + entry.options.separator + twKey
				const v = convertValueMap[type]?.(key, entry.interpolated[key], entry) ?? defaultConvert(key, entry.interpolated[key], entry)
				text.push(`\t${v}`)
			}
		} else if (entry instanceof ControlVar) {
			if (excludeTw.includes(themeKeyName)) continue
			const [type, twName] = splitName(themeKeyName, separator)
			const twType = twTypeMap[type] ?? type
			config[twType] ??= {} as Record<string, string>
			if (twName === undefined) throw new Error(`Theme ControlVar key ${themeKeyName} must be named like {tailwindType}-{name}`)
			const keyName = topLevel?.includes(themeKeyName) ? twName : themeKeyName
			const v = convertValueMap[type]?.(keyName, entry.css, entry) ?? defaultConvert(keyName, entry.css, entry)
			text.push(`\t${v}`)
		}
	}
	
	text.push(`}`)
	return text.join("\n")
}

export type TailwindPluginOptions = {
	defaultsMap?: Record<string, string>
	twTypeMap?: Record<string, string>
	convertValueMap?: Record<string, (key: string, value: string, entry: InterpolatedVars | ControlVar) => string>
	separator?: string
	excludeTw?: string[]
	topLevel?: string[]
}
