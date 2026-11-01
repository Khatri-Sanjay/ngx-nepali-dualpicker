import { readdirSync, readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const root = path.resolve('libs/ngx-nepali-dualpicker/src/lib');
const files = (dir) =>
	readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
		entry.isDirectory() ? files(path.join(dir, entry.name)) : [path.join(dir, entry.name)],
	);
const graph = new Map();
const failures = [];
for (const file of files(root).filter((file) => file.endsWith('.ts') && !file.endsWith('.spec.ts'))) {
	const relative = path.relative(root, file).replaceAll('\\', '/');
	const ast = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
	for (const segment of relative.split('/')) {
		if (!/^[a-z][a-z0-9]*(?:[-.][a-z0-9]+)*$/.test(segment)) {
			failures.push(`${relative}: source paths must use lowercase kebab-case names`);
		}
	}
	if (file.endsWith('.model.ts')) {
		for (const node of ast.statements) {
			if (!(
				ts.isImportDeclaration(node) ||
				ts.isInterfaceDeclaration(node) ||
				ts.isTypeAliasDeclaration(node) ||
				ts.isEnumDeclaration(node)
			)) {
				failures.push(
					`${relative}: model files must contain contracts; move runtime behavior or defaults to a focused module`,
				);
			}
		}
	}
	const edges = [];
	for (const node of ast.statements) {
		if (!(ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) || !node.moduleSpecifier) continue;
		const specifier = node.moduleSpecifier.text;
		if (relative.startsWith('core/') && !specifier.startsWith('.')) {
			failures.push(`${relative}: core cannot import external module ${specifier}`);
		}
		if (!specifier.startsWith('.')) continue;
		const target = path.resolve(path.dirname(file), specifier) + '.ts';
		const targetRelative = path.relative(root, target).replaceAll('\\', '/');
		if (targetRelative.startsWith('../')) failures.push(`${relative}: library cannot import workspace consumers`);
		if (!existsSync(target)) failures.push(`${relative}: unresolved direct import ${specifier}`);
		if (relative.startsWith('core/') && !target.startsWith(path.join(root, 'core') + path.sep)) {
			failures.push(`${relative}: core cannot depend on ${specifier}`);
		}
		if (
			relative.startsWith('datepicker/state/') &&
			!targetRelative.startsWith('datepicker/state/') &&
			!targetRelative.startsWith('core/')
		) {
			failures.push(`${relative}: selection/domain state cannot import ${targetRelative}`);
		}
		if (
			(relative.startsWith('configuration/') || relative.startsWith('services/')) &&
			targetRelative.startsWith('datepicker/') &&
			// Configuration may reference pure public option contracts, never picker runtime code.
			!(
				ts.isImportDeclaration(node) &&
				node.importClause?.isTypeOnly &&
				targetRelative === 'datepicker/state/datepicker-options.model.ts'
			)
		) {
			failures.push(`${relative}: integration/configuration cannot depend on picker implementation`);
		}
		edges.push(target);
	}
	graph.set(file, edges);
	if (
		relative.startsWith('core/') ||
		relative.startsWith('datepicker/state/') ||
		relative.startsWith('datepicker/keyboard/')
	) {
		function inspect(node) {
			if (ts.isIdentifier(node) && ['window', 'document', 'navigator'].includes(node.text))
				failures.push(`${relative}: browser global ${node.text} in pure module`);
			ts.forEachChild(node, inspect);
		}
		inspect(ast);
		for (const node of ast.statements) {
			if (ts.isImportDeclaration(node) && !node.moduleSpecifier.text.startsWith('.'))
				failures.push(`${relative}: pure modules cannot import external packages`);
		}
	}
}
const complete = new Set();
function visit(file, stack = []) {
	if (stack.includes(file)) {
		failures.push(`Circular dependency: ${[...stack, file].map((f) => path.relative(root, f)).join(' -> ')}`);
		return;
	}
	if (complete.has(file)) return;
	for (const target of graph.get(file) ?? []) visit(target, [...stack, file]);
	complete.add(file);
}
for (const file of graph.keys()) visit(file);
if (failures.length) {
	process.stderr.write(failures.join('\n') + '\n');
	process.exitCode = 1;
} else {
	process.stdout.write(
		`Architecture verified: ${graph.size} modules, isolated calendar core, direct imports, no cycles.\n`,
	);
}
