import type { TypeToValue } from "types.js"


export const _px = [0, "px"] as [number, "px"]
export const _s = [0, "s"] as [number, "s"]
export const _rem = [0, "rem"] as [number, "rem"]
export const _percent = [0, "%"] as [number, "%"]
export const _deg = [0, "deg"] as [number, "deg"]
export const _num = [0, ""] as [number, ""]
/**
 * strUnit can also be used to accept any Var instance.
 */
export const _str = ["", ""] as [string, ""]

enum BORDER_TYPE {
	dotted = "dotted",
	dashed = "dashed",
	solid = "solid",
	double = "double",
	groove = "groove",
	ridge = "ridge",
	inset = "inset",
	outset = "outset",
	none = "none",
	hidden = "hidden",
}

export const _borderType = [BORDER_TYPE, ""] as any as [
	BORDER_TYPE |
	// allows passing a string
	keyof typeof BORDER_TYPE, "",
]

export const borderType = {
	_: _borderType,
}

export const rgb = {
	r: _num,
	g: _num,
	b: _num,
}

export const _rgb = [rgb, ""] as [typeof rgb, ""]
export type RgbType = TypeToValue<typeof rgb>

export const rgba = {
	r: _num,
	g: _num,
	b: _num,
	a: _num,
}
export const _rgba = [rgba, ""] as [typeof rgba, ""]
export type RgbaType = TypeToValue<typeof rgba>

export const hsl = {
	h: _deg,
	s: _percent,
	l: _percent,
}
export const _hsl = [hsl, ""] as [typeof hsl, ""]
export type HslType = TypeToValue<typeof hsl>

export const px = { _: _px }
export const time = { _: _s }
export const rem = { _: _rem }


export const border = {
	w: _px,
	type: _borderType,
	color: _rgb,
}
export type BorderType = TypeToValue<typeof border>
