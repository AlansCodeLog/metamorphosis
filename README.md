### 🚧 WORK IN PROGRESS 🚧

![Docs](https://github.com/alanscodelog/metamorphosis/workflows/Docs/badge.svg)
![Build](https://github.com/alanscodelog/metamorphosis/workflows/Build/badge.svg)
[![Release](https://github.com/alanscodelog/metamorphosis/workflows/Release/badge.svg)](https://www.npmjs.com/package/metamorphosis)

# [Docs](https://alanscodelog.github.io/metamorphosis)

Metamorphosis is a css variable management library that helps create and organize variables into easily configurable groups and themes.

Establish a few control variables and convert them into an easy to use design system.

Unlike other css libraries, it's designed to be managed from the js side to allow for easy, consistent user theming. All variables are also strongly typed with typescript.

# Usage

A quick example:

```ts
import { Format, InterpolatedVars, Theme, Unit, Var, VarGroup } from "metamorphosis"

// create the base color variables
const white = new Var("white", Unit.rgb, { r: 255, g: 255, b: 255 }, {
	format: Format.rgb,
})
const black = new Var("black", Unit.rgb, { r: 0, g: 0, b: 0 }, {
	format: Format.rgb,
})

// create interpolated variables based on them
const grays = new InterpolatedVars("gray", Unit.rgb, {
	start: white,
	end: black,
	steps: 10,
	format: Format.rgb
})

// further group/select certain variables
const colors = new VarGroup("color", {
	text: [grays, "8"]
})

// create a theme
const theme = new Theme("mainTheme", {
	grays,
	colors
})

// view theme
// by default dependencies are hidden, white and black won't show
console.log(theme.css())
// :root {
//		gray-0: rgb(255, 255, 255);
//		...
//		gray-10: rgb(0, 0, 0);
//		color-text: rgb(51, 51, 51);
// }

// change a control variable
white.set({ r: 200, g: 200, b: 200 })

// all variables that depend on it update
console.log(theme.css())
// :root {
//		gray-0: rgb(200, 200, 200);
//		...
//		gray-10: rgb(0, 0, 0);
//		color-text: rgb(40, 40, 40);
// }

// attach or detach a theme from an element, if none given, attaches to document.documentElement
// attaching will set the css variables on the element and keep them updated
theme.attach(/* el */)
theme.detach(/* el */)
```

Usage of each class is detailed in the docs.

For an example of more advanced usage, see [the example base theme](https://github.com/AlansCodeLog/metamorphosis/blob/master/src/BaseTheme/BaseTheme.ts) .

