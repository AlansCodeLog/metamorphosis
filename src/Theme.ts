import { keys, setReadOnly } from "@alanscodelog/utils"
import { Base } from "Base.js"
import type { InterpolatedVars } from "InterpolatedVars.js"
import type { Var } from "Var.js"
import type { VarGroup } from "VarGroup.js"


export class Theme<
	T extends Record<string, VarGroup<any> | InterpolatedVars<any, any, any>>,
> extends Base<T> {
	value!: Record<string, string>
	dependencies!: Record<string, string>
	els: HTMLElement[] = []
	// eslint-disable-next-line @typescript-eslint/prefer-readonly
	private _ready: boolean = false
	constructor(name: Theme<T>["name"], values: T) {
		super(name)

		this._checkParams(values)
		setReadOnly(this, "rawValue", {} as T)
		for (const key of keys(values)) {
			this.set(key, values[key])
		}
		this._ready = true
		this._onChange()
	}
	private _checkParams(
		values: T,
	): void {
		let keyList: string[] = []
		for (const key of keys(values)) {
			const val = values[key]
			const css = val.value
			const cssKeys = keys(css)
			for (const cssKey of cssKeys) {
				if (keyList.includes(cssKey)) {
					throw new Error(`Variable ${cssKey} conflicts with another key in the theme.`)
				}
			}
			keyList = keyList.concat(cssKeys)
		}
	}
	set(key: keyof T | string, value: VarGroup<any> | InterpolatedVars<any, any, any>): void {
		this._checkParams({ ...this.rawValue, [key]: value })
		this.removeDependency(this.rawValue?.[key])
		this.rawValue[key as keyof T] = value as T[keyof T]
		this.addDependency(value)
		this._onChange()
		this.notify("change", this.name, key as string, value)
	}
	remove(key: keyof T): void {
		this.removeDependency(this.rawValue?.[key])
		delete this.rawValue[key]
		this._onChange()
	}
	get(key: keyof T): VarGroup<any> | InterpolatedVars<any, any, any> {
		return this.rawValue[key]
	}
	getKeys(): string [] {
		return keys(this.rawValue)
	}
	private _getSubDeps(value: (Var<any, any> | InterpolatedVars<any, any> | VarGroup<any>)[]): Record<string, any> {
		const thisKeys = keys(this.value) // #todo maybe start one level deep initially, would this work?
		const depsValues: Record<string, any> = {} // #todo pass this down instead of assigning twice
		for (const val of value) {
			const deps = (val as any)._dependencies as (Var<any, any> | InterpolatedVars<any, any> | VarGroup<any>)[]
			if (deps.length > 0) {
				const res = this._getSubDeps(deps)
				for (const key of keys(res)) {
					if (!thisKeys.includes(key)) {
						depsValues[key] = res[key]
					}
				}
			}
			for (const cssKey of keys(val.value)) {
				if (!thisKeys.includes(cssKey)) {
					depsValues[cssKey] = val.value[cssKey]
				}
			}
		}

		return depsValues
	}
	protected override _onChange(): void {
		if (!this._ready) return
		const raw = this.rawValue
		const res: Record<string, string> = {}
		for (const key of keys(raw)) {
			const entryValue = raw[key].value
			for (const rawKey of keys(entryValue)) {
				res[rawKey] = entryValue[rawKey]
			}
		}
		this.value = res
		this.dependencies = this._getSubDeps(this._dependencies)
		for (const el of this.els) {
			this._setInterpolatedVarsOnElement(el)
		}
	}
	private _toCss(val: Record<string, string>): string {
		const str = [":root {"]
		for (const key of keys(val)) {
			str.push(`\t--${key}: ${val[key]};`)
		}
		str.push("}")
		return str.join("\n")
	}
	css({ includeDeps = false, onlyDeps = false }: { includeDeps?: boolean, onlyDeps?: boolean } = {}): string {
		const val = includeDeps
			? { ...this.value, ...this.dependencies }
			: onlyDeps
			? this.dependencies
			: this.value
		return this._toCss(val)
	}
	// eslint-disable-next-line @typescript-eslint/prefer-readonly
	private _lastPropertiesSet: string[] = []
	private _setInterpolatedVarsOnElement(el: HTMLElement): void {
		for (const prop of this._lastPropertiesSet) {
			el.style.removeProperty(prop)
		}
		for (const key of keys(this.value)) {
			const prop = `--${key}`
			el.style.setProperty(prop, this.value[key])
			this._lastPropertiesSet.push(prop)
		}
	}
	/**
	 * Attach to an element and automatically set and update the theme's properties on it.
	 *
	 * If no element is passed, attaches to `document.documentElement`.
	 */
	attach(el: HTMLElement = document.documentElement): void {
		this.els.push(el)
		this._setInterpolatedVarsOnElement(el)
	}
	detach(el: HTMLElement = document.documentElement): void {
		const existing = this.els.indexOf(el)
		if (existing >= 0) {
			this.els.splice(existing, 1)
		} else {
			// eslint-disable-next-line no-console
			console.warn("Was not attached to element:", el)
		}
	}
}
