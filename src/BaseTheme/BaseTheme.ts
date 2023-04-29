import { last } from "@alanscodelog/utils"
import * as Format from "Format.js"
import { InterpolatedVars } from "InterpolatedVars.js"
import { createArrayfromRatio, createArrayInterpolator, createRatioInterpolator } from "utils.js"
import { Var } from "Var.js"
import { VarGroup } from "VarGroup.js"

import { createHslColors } from "./createHslColors.js"

import { Theme } from "../Theme.js"
import * as Unit from "../Unit.js"


const separator = ""
const enum TYPE {
	font = "f",
	color = "c",
	width = "w",
	animation = "a",
	variable = "v",
}

const sizesBase = [0, 1, 2, 3, 4, 5, 6, 8, 10, 15, 25]

const sizePxEnd = new Var(
	`${TYPE.variable}SizePxEnd`,
	Unit.px,
	last(sizesBase),
	{ hide: true },
	""
)

const sizesPxArray = sizesBase.map(num => num / 25)

const sizesPx = new InterpolatedVars("px", Unit.px, {
	start: 0,
	end: sizePxEnd,
	roundTo: 3,
	steps: sizesPxArray.length - 1,
	interpolate: createArrayInterpolator(sizesPxArray),
}, "")

const sizeRemStart = new Var(
	`${TYPE.variable}SizeRemStart`,
	Unit.rem,
	0.64,
	{ hide: true },
	""
)
const sizeRemRatio = new Var(
	`${TYPE.variable}SizeRemRatio`,
	{ _: [0, ""]},
	1.25,
	{ hide: true },
	""
)

const sizesRemArray = createArrayfromRatio({ ratio: 1.25, length: 10 })

const sizesRem = new InterpolatedVars("rem", Unit.rem, {
	start: sizeRemStart,
	end: 0,
	roundTo: 3,
	steps: 10,
	interpolate: createRatioInterpolator(sizesRemArray),
}, "")

const { controls: colorControls, colors } = createHslColors("c", undefined, undefined, undefined, "")
// eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-unused-vars

const opacities = new InterpolatedVars("cOpacity", Unit.rgba, {
	start: { r: 0, g: 0, b: 0, a: 0 },
	end: { r: 0, g: 0, b: 0, a: 1 },
	steps: 10,
	roundTo: 3,
	format: Format.rgba,
}, separator)

const colorGroup = new VarGroup(TYPE.color, {
	Warning: [Yellow, "5"],
	WarningLight: [Yellow, "2"],
	WarningDark: [Yellow, "8"],
	Ok: [Green, "5"],
	OkLight: [Green, "2"],
	OkDark: [Green, "8"],
	Error: [Red, "5"],
	ErrorLight: [Red, "2"],
	ErrorDark: [Red, "7"],
	Bg: [Gray, "1"],
	BgLight: [Gray, "0"],
	BgDark: [Gray, "2"],
	BgFocused: [Blue, "2"],
	BgHover: [Blue, "1"],
	BgDisabled: [Gray, "1"],
	BgTableRow: [Gray, "1"],
	Text: [Gray, "8"],
	TextSecondary: [Gray, "6"],
	TextShadow: [Gray, "3"],
	TextFocused: [Blue, "6"],
	TextDisabled: [Blue, "5"],
	TextPlaceholder: [Gray, "5"],
	TextPlaceholderFocused: [Gray, "6"],
	TextActive: [Gray, "6"],
	TextLink: [Blue, "7"],
	TextLinkFocused: [Blue, "5"],
	TextLinkVisited: [Purple, "6"],
	TextHoverShadow: [Gray, "3"],
	Border: [Gray, "4"],
	BorderFocused: [Blue, "5"],
	BorderSoft: [Gray, "3"],
	BorderSoftFocused: [Blue, "3"],
	BorderDisabled: [Gray, "3"],
	BorderActive: [Gray, "3"],
	BorderHover: [Gray, "3"],
	Shadow: [Gray, "3"],
	ShadowActive: [Gray, "4"],
	ShadowHover: [Gray, "5"],
	ShadowFocused: [Blue, "2"],
	Recording: [Red, "7"],
}, "")

const mainControls = new VarGroup(TYPE.variable, {
	PxEnd: sizePxEnd,
	RemStart: sizeRemStart,
	RemRatio: sizeRemRatio,
}, "")

const widthGroup = new VarGroup(TYPE.width, {
	TextHoverShadow: [sizesRem, "1"],
	Border: [sizesPx, "1"],
	BorderDark: [sizesPx, "1"],
	BorderRadius: [sizesPx, "5"],
	Shadow: [sizesPx, "2"],
	PaddingXXS: [sizesPx, "2"],
	PaddingXS: [sizesPx, "3"],
	PaddingS: [sizesPx, "4"],
	PaddingM: [sizesPx, "7"],
	PaddingL: [sizesPx, "9"],
	PaddingXl: [sizesPx, "10"],
	TableGrip: [sizesPx, "4"],
}, "")

const timeGroup = new VarGroup(TYPE.animation, {
	TimeNormal: new Var("Time", Unit.time, 0.2),
}, "")

const fontSizeGroup = new VarGroup(TYPE.font, {
	SizeS: [sizesRem, "1"],
	SizeM: [sizesRem, "2"],
	SizeL: [sizesRem, "4"],
	SizeXL: [sizesRem, "6"],
	SizeXXL: [sizesRem, "8"],
	Family: new Var("family", { _: Unit._str }, "Arial, Helvetica, sans-serif"),
}, "")

/**
 * An example base theme.
 */
export const baseTheme = new Theme("units-theme", {
	widthGroup,
	timeGroup,
	colorGroup,
	colorControls,
	mainControls,
	fontSizeGroup,
	opacities,
})

