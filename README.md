### 🚧 WORK IN PROGRESS 🚧

![Docs](https://github.com/alanscodelog/metamorphosis/workflows/Docs/badge.svg)
![Build](https://github.com/alanscodelog/metamorphosis/workflows/Build/badge.svg)
[![Release](https://github.com/alanscodelog/metamorphosis/workflows/Release/badge.svg)](https://www.npmjs.com/package/metamorphosis)

# [Docs](https://alanscodelog.github.io/metamorphosis)

Metamorphosis is a css variable management library that helps create and organize variables into easily configurable themes.

Establish a few control variables and easily create interpolated variables with multiple stops.

It can be used by itself or as a compliment to other css libraries (e.g. tailwind). It's also easy to integrate other interpolators such as colorsjs.io.

It's designed to allow management from the js side to allow for easy, consistent user theming in apps (though it can be used to statically generate css variables as well).

All variables are strongly typed with typescript.

# Usage

A quick example:

```ts
const paddingMin = new ControlVar(Units.px, 0)
const paddingMax = new ControlVar(Units.px, 200)


const padding = new InterpolatedVars("padding",
	Units.px,
	[paddingMin, paddingMax],
/* { steps: 10 } i.e. 0-9 */
)

const white = new ControlVar(Units.rgb, { r: 255, g: 255, b: 255 })
const black = new ControlVar(Units.rgb, { r: 0, g: 0, b: 0 })

const grays = new InterpolatedVars("gray", Units.rgb, [white, black],
	{
		// custom percentages
		steps: [0, 0.2, 0.8, 1],
		keyName: paddedKeyNamer(1000), // gray-000
	})

const lightRed = new ControlVar(Units.rgb, { r: 255, g: 0, b: 0 })
const saturatedMiddleRed = new ControlVar(Units.rgb, { r: 255, g: 170, b: 170 })
const darkRed = new ControlVar(Units.rgb, { r: 50, g: 0, b: 0 })

// interpolated along multiple values
const red = new InterpolatedVars("red", Units.rgb, [
	lightRed,
	saturatedMiddleRed,
	darkRed,
])

// with custom stops
const reds = new InterpolatedVars("red", Units.rgb, [
	[0, lightRed],
	[0.25, saturatedMiddleRed],
	[0.75, darkRed],
])


const theme = new Theme({
	grays,
	padding,
})

// theme.css
// :root {
// 	--gray-000: rgb(255, 255, 255);
// 	--gray-250: rgb(204, 204, 204);
// 	--gray-500: rgb(51, 51, 51);
// 	--gray-750: rgb(0, 0, 0);
// 	--padding-0: 0px;
// 	...
// 	--padding-9: 200px;
// }

// change a control variable
white.set({ r: 200, g: 200, b: 200 })

// all variables that depend on it update
// theme.css
// :root {
//		--gray-000: rgb(200, 200, 200);
//		...
//		--gray-750: rgb(0, 0, 0);
// }

// attach or detach a theme from an element
// if none given attaches to document.documentElement
// attaching will set the css variables on the element and keep them updated
theme.attach(/* el */)
theme.detach(/* el */)

// add/remove variables
theme.add({ reds })
theme.add({ lightRed })
theme.remove("lightRed")

// ADVANCED

// custom unit creation
// the function argument is used as the unit definition
const fancyRem = Units.createSimpleUnit("fancy-rem") // same as  ({ _ }: { _: number }) => `${_}fancy-rem`
const fancyUnit = (
	{ some, fancy, unit }:
	{ some: number, fancy: "string", unit: boolean }
) => `${some}px ${fancy} ${unit}`

// so long as the control vars take the same arguments
// you can use unit functions as custom formatters:
const customRgbFormatter = ({ r, g, b, a = 0 }: Units.Rgb) => `R:${r} G:${g} B:${b} ${a ? `A:${a}` : ""}`
const grays3 = new InterpolatedVars("gray", customRgbFormatter, [white, black])

// custom interpolation, for example, using colorjs.io

// import Color from "colorjs.io"

const grays4 = new InterpolatedVars("gray", Units.rgb, [white, black], {
	interpolator: ({ percent, state, start, end }) => {
		const key = start.css + end.css
		// re/create state if at start or if key switched (due to
		// multiple stops)
		if (state.key !== key) {
			state.range = new Color(start.css).range(new Color(end.css), { space: "srgb" })
			state.key = key
		}

		const val = state.range(percent).coords
		return { r: val[0] * 255, g: val[1] * 255, b: val[0] * 255 }
	},
})

// we can also be a bit more flexible at the cost of strict typing and
// use colorjs.io's parsing abilities to pass the colors as strings in any format

const white2 = new ControlVar(Units.str, `rgb(255, 255, 255)`)
const black2 = new ControlVar(Units.str, `#000000`)

const grays5 = new InterpolatedVars("gray", Units.str, [white2, black2], {
	interpolator: ({ percent, state, start, end }) => {
		const key = start.css + end.css
		if (state.key !== key) {
			state.range = new Color(start.css).range(new Color(end.css), { space: "srgb" })
			state.key = key
		}
		/* ... */
		return state.range(percent)
			.to("srgb") // our preferred output space
			.toString({ format: "srgb" })
	},
})
```

For an example of more advanced usage, see [the example base theme](https://github.com/AlansCodeLog/metamorphosis/blob/master/src/BaseTheme.ts).

The library has optional peer dependencies for tailwind and colorjs.io. colorjs.io is only needed if importing the base theme from `metamorphosis/BaseTheme`. And tailwind is only needed if importing from `metamorphosis/tailwind`.
