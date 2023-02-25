export const rgb = ({ r, g, b }: { r: string, g: string, b: string }): string => `rgb(${r}, ${g}, ${b})`
export const rgba = ({ r, g, b, a }: { r: string, g: string, b: string, a: string }): string => `rgb(${r}, ${g}, ${b}, ${a})`
export const hsl = ({ h, s, l }: { h: string, s: string, l: string }): string => `hsl(${h}, ${s}, ${l})`
export const str = ({ _ }: { _: string }): string => `${_}`
export const join = (obj: any): string => Object.values(obj).join(" ")
