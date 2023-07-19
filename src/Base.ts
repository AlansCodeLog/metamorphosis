export class Base {
	protected _dependants: Base[] = []

	addDep(dep: any): void {
		this._dependants.push(dep)
	}

	removeDep(dep: any): void {
		const i = this._dependants.indexOf(dep)
		if (i >= 0) {
			this._dependants.slice(i, 1)
		}
	}

	protected _notify(): void {
		for (const dep of this._dependants) {
			dep.notify(this)
		}
	}

	protected notify(..._any: any[]): void {
		throw new Error("Extending class must implement.")
	}
}
