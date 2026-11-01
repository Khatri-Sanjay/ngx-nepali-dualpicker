import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';
export function loadDocModule(filename, cache = new Map()) {
	const file = path.resolve(filename);
	if (cache.has(file)) return cache.get(file);
	if (file.endsWith('.json')) return JSON.parse(readFileSync(file, 'utf8'));
	const exports = {};
	cache.set(file, exports);
	const require = (specifier) => {
		if (!specifier.startsWith('.')) throw new Error(`Documentation data must be pure: ${specifier}`);
		const base = path.resolve(path.dirname(file), specifier);
		const resolved = [base, base + '.ts', base + '.json'].find((p) => existsSync(p));
		if (!resolved) throw new Error(`Unresolved documentation data: ${specifier} from ${file}`);
		return loadDocModule(resolved, cache);
	};
	const code = ts.transpileModule(readFileSync(file, 'utf8'), {
		compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
	}).outputText;
	vm.runInNewContext(`(function(exports,require){${code}\n})`, {})(exports, require);
	return exports;
}
