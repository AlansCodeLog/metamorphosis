/* https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Values_and_Units */


export type Rgb = { r: number, g: number, b: number, a?: number }

export const rgb = ({ r, g, b, a }: Rgb): string => `rgb(${r}, ${g}, ${b}${a !== undefined ? ` / ${a}` : ""})`

export type Hsl = { h: number, s: number, l: number, a?: number }
export const hsl = ({ h, s, l, a }: Hsl): string => `hsl(${h}, ${s}%, ${l}%${a !== undefined ? ` / ${a}` : ""})`

export type Hwb = { h: number, w: number, b: number, a?: number }
export const hwb = ({ h, w, b, a }: Hwb): string => `hwb(${h}, ${w}%, ${b}%${a !== undefined ? ` / ${a}` : ""})`

export type Lch = { l: number, c: number, h: number, a?: number }
export const lch = ({ l, c, h, a }: Lch): string => `lch(${l}, ${c}, ${h}${a !== undefined ? ` / ${a}` : ""})`
export const oklch = (val: Parameters<typeof lch>[0]): string => `ok${lch(val)}`

export type Lab = { l: number, a: number, b: number, A?: number }
// eslint-disable-next-line @typescript-eslint/naming-convention
export const lab = ({ l, a, b, A }: Lab): string => `lab(${l}, ${a}, ${b}${A !== undefined ? ` / ${A}` : ""})`
export const oklab = (val: Parameters<typeof lab>[0]): string => `ok${lab(val)}`

// export const createSimpleUnit = (suffix: string) => ({ _ }: { _: number }): string => `${_}${suffix}`
// export const createSimpleUnit = <T extends number | string = number>(suffix: string) => ({ _ }: { _: T }): string => `${_}${suffix}`
export const createSimpleUnit = <T extends number | string = number>(suffix: string) => ({ _ }: Record<"_", T>): string => `${_}${suffix}`

export const px = createSimpleUnit("px")

export const pt = createSimpleUnit("pt")
export const pc = createSimpleUnit("pc")
export const inch = createSimpleUnit("in")
export const Q = createSimpleUnit("Q")
export const mm = createSimpleUnit("mm")
export const cm = createSimpleUnit("cm")

export const em = createSimpleUnit("em")
export const rem = createSimpleUnit("rem")

export const ex = createSimpleUnit("ex")
export const ch = createSimpleUnit("ch")
export const cap = createSimpleUnit("cap")
export const ic = createSimpleUnit("ic")

export const lh = createSimpleUnit("lh")
export const rlh = createSimpleUnit("rlh")

export const vw = createSimpleUnit("vw")
export const vh = createSimpleUnit("vh")

export const vmin = createSimpleUnit("vmin")
export const vmax = createSimpleUnit("vmax")

export const vb = createSimpleUnit("vb")
export const vi = createSimpleUnit("vi")

export const svw = createSimpleUnit("svw")
export const svh = createSimpleUnit("svh")

export const lvw = createSimpleUnit("lvw")
export const lvh = createSimpleUnit("lvh")

export const dvw = createSimpleUnit("dvw")
export const dvh = createSimpleUnit("dvh")

export const s = createSimpleUnit("s")
export const ms = createSimpleUnit("ms")

export const rad = createSimpleUnit("rad")
export const grad = createSimpleUnit("grad")
export const turn = createSimpleUnit("turn")
export const deg = createSimpleUnit("deg")
export const cqw = createSimpleUnit("cqw")
export const cqh = createSimpleUnit("cqh")
export const cqi = createSimpleUnit("cqi")
export const cqb = createSimpleUnit("cqb")
export const cqmin = createSimpleUnit("cqmin")
export const cqmax = createSimpleUnit("cqmax")

export const percent = createSimpleUnit("percent")
export const fr = createSimpleUnit("fr")

export const dpi = createSimpleUnit("dpi")
export const dpcm = createSimpleUnit("dpcm")
export const dppx = createSimpleUnit("dppx")


export type Str = { _: string }
export type Num = { _: number }
export const str = createSimpleUnit<string>("")
export const num = createSimpleUnit("")
export const cssVar = ({ _ }: { _: string }): string => `var(--${_})`

