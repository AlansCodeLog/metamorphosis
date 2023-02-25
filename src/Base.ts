import { isArray, keys, unreachable } from "@alanscodelog/utils"
import type { InterpolatedVars } from "InterpolatedVars.js"
import type { Var } from "Var.js"
import type { VarGroup } from "VarGroup.js"

import { type Listener, regexVariable } from "./types.js"


export class Base<
	T,
	TListeners = T,
	TKeys extends keyof T = keyof T,
> {
	name: string
	readonly rawValue!: T
	protected readonly _dependants: (Var<any, any, any> | VarGroup<any> | InterpolatedVars<any, any>)[] = []
	protected readonly _dependencies: (Var<any, any, any> | VarGroup<any> | InterpolatedVars<any, any>)[] = []
	listeners: {
		change: Listener<TListeners>[]
	} = { change: []}
	static SEPARATOR: string = "-"
	separator: string = "-"
	constructor(
		name: string,
		separator?: string
	) {
		if (!name.match(regexVariable)) {
			throw new Error(`Invalid variable name: ${name}`)
		}
		this.name = name
		if (separator !== undefined) this.separator = separator
	}
	protected _stringify(val: T[TKeys], type: string): String {
		return `${val as string}${type[1]}`
	}
	removeDependency(value: Var<any, any, any> | VarGroup<any> | InterpolatedVars<any, any, any> | Record<string, Var<any, any>> | [InterpolatedVars<any, any, any>, string] | any): void {
		if (typeof value !== "object") return
		const val = value instanceof Base ? { value } : value
		for (const key of keys(val)) {
			const subValue = val[key]
			if (subValue instanceof Base || isArray(subValue)) {
				const dep = isArray(subValue) ? subValue[0] : subValue
				{
					const i = (dep)._dependants.indexOf(this)
					if (i < 0) unreachable()
					; (dep)._dependants.splice(i, 1)
				}
				{
					const i = this._dependencies.indexOf(dep)
					if (i < 0) unreachable()
					this._dependencies.splice(i, 1)
				}
			}
		}
	}
	addDependency(value: Var<any, any, any> | VarGroup<any> | InterpolatedVars<any, any, any> | Record<string, Var<any, any>> | [InterpolatedVars<any, any, any>, string] | any): void {
		if (typeof value !== "object") return
		const val = value instanceof Base ? { value } : value

		for (const key of keys(val)) {
			const subValue = val[key]
			if (subValue instanceof Base || isArray(subValue)) {
				const dep = isArray(subValue) ? subValue[0] : subValue
				dep._dependants.push(this)
				this._dependencies.push(dep)
			}
		}
	}
	protected _onChange(): void {
		throw new Error("Extending class should implement.")
	}
	notify(type: keyof Var["listeners"], name: string, key: string, value: any): void {
		this._onChange()
		for (const listener of this.listeners[type]) listener(name, key, value)
		for (const instance of this._dependants) instance.notify(type, name, key, value)
	}
	on<TEventType extends keyof Base<T, TListeners, TKeys>["listeners"] = "change">(
		type: TEventType, cb: Base<T, TListeners, TKeys>["listeners"][TEventType][number]
	): void {
		this.listeners[type].push(cb)
	}
	off<TEventType extends keyof Base<T, TListeners, TKeys>["listeners"] = "change">(
		type: TEventType, cb: Base<T, TListeners, TKeys>["listeners"][TEventType][number]
	): void {
		const i = this.listeners[type].indexOf(cb)
		if (i >= 0) this.listeners[type].splice(i, 1)
		else {
			// eslint-disable-next-line no-console
			console.warn("Unknown listener, no event listeners removed.", cb)
		}
	}
}
