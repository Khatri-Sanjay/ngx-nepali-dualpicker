import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';
import { loadDocModule } from './load-doc-content.mjs';

// Compile the actual displayed strings against the built package, including Angular templates.
const root = fileURLToPath(new URL('../', import.meta.url));
const app = path.join(root, 'apps/documentation/src/app');
const fixture = path.join(root, 'tmp/documentation-examples');
mkdirSync(fixture, { recursive: true });
function loadPure(relative) {
	return loadDocModule(path.join(app, relative));
}
function classMember(relative, name, kind) {
	const file = ts.createSourceFile(
		relative,
		readFileSync(
			path.join(
				relative.startsWith('pages/playground/') ? path.join(root, 'apps/playground/src/app') : app,
				relative,
			),
			'utf8',
		),
		ts.ScriptTarget.Latest,
		true,
	);
	const declaration = file.statements.find(ts.isClassDeclaration);
	const member = declaration.members.find((member) => member.name?.getText(file) === name);
	if (kind === 'getter') return member.body.statements.find(ts.isReturnStatement).expression.getText(file);
	if (!ts.isStringLiteral(member.initializer) && !ts.isNoSubstitutionTemplateLiteral(member.initializer))
		throw new Error(`Expected literal source: ${name}`);
	return member.initializer.text;
}
const docs = loadPure('content/docs.catalog.ts');
const { examples } = loadPure('../../../shared/content/picker-examples.ts');
const sourceExpression = classMember('components/demo-card/demo-card.component.ts', 'typescript', 'getter');
const htmlExpression = classMember('components/demo-card/demo-card.component.ts', 'html', 'getter');
const files = [];
function writeExample(id, source, html, templateName = 'picker-example.html') {
	const directory = path.join(fixture, id);
	mkdirSync(directory, { recursive: true });
	const filename = path.join(directory, 'example.ts');
	writeFileSync(filename, source);
	files.push(filename);
	if (html) writeFileSync(path.join(directory, templateName), html);
}
for (const example of examples) {
	const instance = { config: () => example.config, definition: example, initialValue: () => example.initial };
	const evaluate = (expression) =>
		vm.runInNewContext(`(function(){return ${expression};}).call(instance)`, { instance, JSON });
	writeExample(example.id, evaluate(sourceExpression), evaluate(htmlExpression));
}
writeExample('quick-start', docs.quickStart);
for (const example of loadPure('content/generated/configuration-examples.generated.ts').configurationExamples)
	writeExample('config-' + example.name, example.code);
const playgroundSource = classMember('pages/playground/playground.component.ts', 'typescript', 'getter');
const playgroundHtml = classMember('pages/playground/playground.component.ts', 'html', 'getter');
for (const disabled of [false, true]) {
	const instance = {
		configCode: () => JSON.stringify({ calendar: 'BS', selectionMode: 'range', inline: true }),
		value: () => null,
		disabled: () => disabled,
	};
	instance.html = vm.runInNewContext(`(function(){return ${playgroundHtml};}).call(instance)`, { instance });
	const source = vm.runInNewContext(`(function(){return ${playgroundSource};}).call(instance)`, { instance });
	writeExample(`playground-${disabled ? 'disabled' : 'enabled'}`, source);
}
const conversionExpression = classMember('pages/conversion/conversion-example.component.ts', 'code', 'getter');
for (const direction of ['BS', 'AD']) {
	const instance =
		direction === 'BS'
			? { direction, year: 2080, month: 10, day: 1 }
			: { direction, year: 2024, month: 1, day: 15 };
	const source = vm.runInNewContext(`(function(){return ${conversionExpression};}).call(instance)`, { instance });
	writeExample(`converter-${direction}`, source);
}
for (const page of docs.pages)
	for (const [index, section] of page.sections.entries()) {
		if (
			!section.code ||
			(section.language && section.language !== 'TypeScript') ||
			section.code === docs.quickStart
		)
			continue;
		let source = section.code;
		if (source.startsWith('const config:'))
			source = `import type { DatePickerConfig } from 'ngx-nepali-dualpicker';\n${source}`;
		writeExample(`guide-${page.id}-${index}`, source);
	}
const formsFile = ts.createSourceFile(
	'forms.ts',
	readFileSync(path.join(app, 'pages/forms/forms-example.component.ts'), 'utf8'),
	ts.ScriptTarget.Latest,
	true,
);
const templates = {};
for (const statement of formsFile.statements.filter(ts.isVariableStatement))
	for (const declaration of statement.declarationList.declarations) {
		if (ts.isNoSubstitutionTemplateLiteral(declaration.initializer))
			templates[declaration.name.getText(formsFile)] = declaration.initializer.text;
	}
writeExample(
	'reactive-form',
	classMember('pages/forms/forms-example.component.ts', 'reactiveCode'),
	templates.reactiveHtml,
	'reactive-example.html',
);
writeExample(
	'model-form',
	classMember('pages/forms/forms-example.component.ts', 'modelCode'),
	templates.modelHtml,
	'model-example.html',
);
writeFileSync(
	path.join(fixture, 'tsconfig.json'),
	JSON.stringify(
		{
			compilerOptions: {
				target: 'ES2022',
				module: 'ES2022',
				moduleResolution: 'bundler',
				strict: true,
				types: [],
				skipLibCheck: false,
				experimentalDecorators: true,
				useDefineForClassFields: false,
				noEmit: true,
				lib: ['ES2022', 'DOM'],
				baseUrl: root,
				paths: {
					'ngx-nepali-dualpicker': ['dist/ngx-nepali-dualpicker'],
					'ngx-nepali-dualpicker/core': ['dist/ngx-nepali-dualpicker/core'],
				},
			},
			angularCompilerOptions: { strictTemplates: true, strictInjectionParameters: true },
			files,
		},
		null,
		2,
	),
);
const cli = path.join(root, 'node_modules/@angular/compiler-cli/bundles/src/bin/ngc.js');
const result = spawnSync(process.execPath, [cli, '-p', path.join(fixture, 'tsconfig.json')], {
	cwd: root,
	stdio: 'inherit',
});
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);
console.log(`PASS: ${files.length} displayed documentation examples compile against the built Angular package.`);
