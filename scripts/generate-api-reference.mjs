import ts from 'typescript';
import { format } from 'prettier';
import { readFileSync, writeFileSync } from 'node:fs';

// Generate documentation signatures from source; never import implementation into the demo.
const root = 'libs/ngx-nepali-dualpicker/src/';
const project = ts.readConfigFile('libs/ngx-nepali-dualpicker/tsconfig.lib.json', ts.sys.readFile);
const parsed = ts.parseJsonConfigFileContent(project.config, ts.sys, 'libs/ngx-nepali-dualpicker');
const program = ts.createProgram(parsed.fileNames, parsed.options);
const checker = program.getTypeChecker();
const source = (file) =>
	program.getSourceFile(root + file) ??
	ts.createSourceFile(file, readFileSync(root + file, 'utf8'), ts.ScriptTarget.Latest, true);
const componentDescriptions = {
	inputContainer: 'Read the input container ElementRef after view initialization; undefined before the view exists.',
	monthColumn: 'Read the month-selector scroll column ElementRef when rendered.',
	yearColumn: 'Read the year-selector scroll column ElementRef when rendered.',
	config: 'Read-only signal of component configuration overrides, before global defaults are merged.',
	configInput: 'Setter backing Angular input alias config. Use [config] in templates.',
	formControl:
		'Read-only signal holding the optional FormControl input; Angular forms directives remain the recommended value integration.',
	formControlInput: 'Setter backing Angular input alias formControl.',
	placeholder: 'Read-only signal of the input placeholder override.',
	placeholderInput: 'Setter backing Angular input alias placeholder.',
	hasError: 'Read-only signal for visual error styling; does not register a form validator.',
	hasErrorInput: 'Setter backing Angular input alias hasError.',
	dateSelected: 'Emits the mode-specific formatted selection, clear or converted value.',
	pickerOpened: 'Emits when open() opens the popup.',
	pickerClosed: 'Emits on close(); closing also marks the forms control touched.',
	calendarTypeChanged: 'Emits AD or BS when the active calendar switches.',
	parseError:
		'Emits rejected manual input, range-end and preset selections with a message. Value is original input text or the preset label.',
	currentCalendarType: 'Active BS/AD calendar signal. Use switchCalendarType() instead of setting it directly.',
	focusedDate:
		'Logical keyboard focus date; component dates use zero-based months. This is not a DOM focus reference.',
	todayBS: 'BS date captured during initialization, with zero-based month.',
	todayAD: 'Local Gregorian date captured during initialization, with zero-based month.',
	currentDisplayDate: 'Displayed year/month/day; month is zero-based. Navigate through methods to refresh the grid.',
	selectedDate: 'Single-mode selected date signal, or null; zero-based month.',
	selectedDates: 'Multiple-mode selected date objects; zero-based months.',
	startDate: 'Range start date signal, or null; zero-based month.',
	endDate: 'Range end date signal, or null; zero-based month.',
	hoverDate: 'Temporary range-preview endpoint signal; zero-based month.',
	formattedDate: 'Selected value formatted for display in the input.',
	inputValue: 'Current input text, including text being edited manually.',
	years: 'Selectable year list clamped to calendar data and configured bounds.',
	isOpen: 'Popup visibility signal; inline calendars render independently of it.',
	isTouched: 'Whether the picker has been marked touched by interaction or close().',
	showMonthYearPicker: 'Whether month/year selection is shown instead of the day grid.',
	isInputFocused: 'Input focus styling signal.',
	isDisabled: 'Forms disabled state; set through the Angular forms control.',
	dropdownTop: 'Calculated popup vertical viewport position in pixels, or null.',
	dropdownLeft: 'Calculated popup horizontal viewport position in pixels, or null.',
	dropdownWidth: 'Calculated popup width in pixels, or null.',
	rangeMode: 'Whether current selection is a range; change via toggleMode().',
	multipleMode: 'Whether current selection is multiple; change via toggleMode().',
	direction: 'Layout direction used by the picker view.',
	isMobileCompact: 'Whether compact mobile presentation is active.',
	isDarkMode: 'Resolved dark-theme styling flag.',
	currentTheme: 'Resolved component theme signal, or null before application.',
	mergedConfig: 'Computed configuration after built-in/global/component options merge.',
	showDayPicker: 'Computed inverse of showMonthYearPicker.',
	effectivePlaceholder: 'Computed component placeholder override or configured placeholder.',
	currentMonthsMapping: 'Computed month labels for active calendar, language and display style.',
	getCurrentMonthLabel: 'Return the displayed month label in the active calendar/language.',
	rotatedDayNames: 'Computed weekday headings rotated to firstDayOfWeek.',
	currentMonthData: 'Calendar columns keyed 0–6; each column contains day numbers or null padding cells.',
	daysMapping: 'Available built-in weekday label mappings.',
	dateFormatter: 'Current display formatter metadata used by the view.',
	outputFormatter: 'Current output formatter metadata used for form/event values.',
	setCurrentMonthData: 'Rebuild the day grid for currentDisplayDate and firstDayOfWeek.',
	selectDate: 'Select a day number in the displayed month, honoring date restrictions and current selection mode.',
	isDateSelectable: 'Check a displayed-month day against calendar validity and restrictions.',
	isDateSelected: 'Check if a displayed-month day belongs to the current selection.',
	isDateInRange: 'Check if a displayed-month day lies within the selected range.',
	isRangeStart: 'Check if a displayed-month day matches the range start.',
	isRangeEnd: 'Check if a displayed-month day matches the range end.',
	isDateInHoverRange: 'Check if a displayed-month day lies in the pending range preview.',
	formatValue:
		'Refresh displayed text and propagate formatted selection; prefer selection methods to avoid unwanted events.',
	canNavigateMonth: 'Check whether moving -1 or +1 month remains inside calendar/year bounds.',
	toggleMonthYearPicker: 'Switch between the day grid and month/year selectors.',
	closeMonthYearPicker: 'Return to the day grid.',
	isDateFocused: 'Check if the logical keyboard focus matches a displayed-month day.',
};
const config = source('lib/configuration/datepicker-config.model.ts');
const configuration = config.statements.find(
	(node) => ts.isInterfaceDeclaration(node) && node.name.text === 'DatePickerConfig',
);
const configTypes = Object.fromEntries(
	configuration.members.map((member) => [member.name.getText(config), member.type.getText(config)]),
);
const entries = [
	['NgxNepaliDualpicker', 'lib/datepicker/ngx-nepali-dualpicker.component.ts'],
	['DateConversionService', 'lib/services/date-conversion.service.ts'],
	['DatePickerConfigService', 'lib/configuration/datepicker-config.service.ts'],
	['ThemeService', 'lib/themes/theme.service.ts'],
	['NepaliDatePipe', 'lib/pipes/nepali-date.pipe.ts'],
	['DateCalculator', 'lib/core/calendar/date-calculator.ts'],
	['DateValidator', 'lib/core/validation/date-validator.ts'],
	['DateParser', 'lib/core/parsing/date-parser.ts'],
];
const signatures = entries.map(([name, file]) => {
	const ast = source(file);
	const declaration = ast.statements.find((node) => ts.isClassDeclaration(node) && node.name?.text === name);
	const rows = declaration.members
		.filter(
			(member) =>
				member.name &&
				!member.modifiers?.some((modifier) =>
					[ts.SyntaxKind.PrivateKeyword, ts.SyntaxKind.ProtectedKeyword].includes(modifier.kind),
				),
		)
		.filter(
			(member) =>
				!['DateCalculator', 'DateValidator', 'DateParser'].includes(name) ||
				member.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.StaticKeyword),
		)
		.map((member) => {
			const name = member.name.getText(ast);
			const method = ts.isMethodDeclaration(member) || ts.isSetAccessorDeclaration(member);
			const type = method
				? `(${member.parameters.map((parameter) => parameter.getText(ast)).join(', ')}) → ${member.type?.getText(ast) ?? 'void'}`
				: (member.type?.getText(ast) ??
					checker
						.typeToString(checker.getTypeAtLocation(member), member, ts.TypeFormatFlags.NoTruncation)
						.replace(/import\("[^"]+"\)\./g, ''));
			const comment = ts
				.getJSDocCommentsAndTags(member)
				.map((doc) => (typeof doc.comment === 'string' ? doc.comment : ''))
				.filter(Boolean)
				.join(' ');
			const description =
				(declaration.name.text === 'NgxNepaliDualpicker' ? componentDescriptions[name] : undefined) ||
				comment ||
				(name.startsWith('ng')
					? 'Angular lifecycle hook; Angular calls this automatically.'
					: name.startsWith('on')
						? 'View event handler; normally invoked by the component template or host listener.'
						: method
							? 'Public callable member. See the service/interaction tables above for integration behavior; component helpers operate on the displayed calendar.'
							: 'Exposed component state or view reference. Read signals by calling them; direct mutation can bypass validation. Prefer configuration, forms and events.');
			return { name, type, description };
		});
	return { name, rows };
});
writeFileSync(
	'apps/documentation/src/app/content/api-signatures.generated.ts',
	'// Generated by scripts/generate-api-reference.mjs. Do not edit by hand.\n' +
		`export const configurationTypes = ${JSON.stringify(configTypes, null, 2)} as const;\nexport const publicMembers = ${JSON.stringify(signatures, null, 2)} as const;\n`,
);

const entryPoints = ['public-api.ts', 'core-api.ts'];
const surface = [];
const declarations = new Map();
for (const entry of entryPoints) {
	const file = source(entry);
	const symbol = checker.getSymbolAtLocation(file);
	for (const exported of checker.getExportsOfModule(symbol)) {
		const resolved = exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported;
		const declaration = resolved.declarations?.[0];
		if (!declaration) continue;
		const location = declaration.getSourceFile();
		const kind = ts.isClassDeclaration(declaration)
			? 'class'
			: ts.isInterfaceDeclaration(declaration)
				? 'interface'
				: ts.isTypeAliasDeclaration(declaration)
					? 'type'
					: ts.isEnumDeclaration(declaration)
						? 'enum'
						: ts.isFunctionDeclaration(declaration)
							? 'function'
							: 'constant';
		const signature = ts.isFunctionDeclaration(declaration)
			? checker
					.signatureToString(
						checker.getSignatureFromDeclaration(declaration),
						declaration,
						ts.TypeFormatFlags.NoTruncation,
					)
					.replace(/import\("[^"]+"\)\./g, '')
			: checker
					.typeToString(checker.getTypeAtLocation(declaration), declaration, ts.TypeFormatFlags.NoTruncation)
					.replace(/import\("[^"]+"\)\./g, '');
		surface.push({
			name: exported.name,
			entryPoint: entry === 'public-api.ts' ? 'ngx-nepali-dualpicker' : 'ngx-nepali-dualpicker/core',
			kind,
			signature,
			source: location.fileName.replaceAll('\\', '/').replace(/^.*?(libs\/ngx-nepali-dualpicker\/)/, '$1'),
			description: ts.displayPartsToString(resolved.getDocumentationComment(checker)),
		});
		if (['interface', 'type', 'enum'].includes(kind))
			declarations.set(exported.name, declaration.getText(location));
	}
}
writeFileSync(
	'apps/documentation/src/app/content/generated/public-surface.generated.ts',
	'// Generated from public entry points. Do not edit.\nexport const publicSurface = ' +
		JSON.stringify(surface, null, 2) +
		' as const;\nexport const typeDeclarations = ' +
		JSON.stringify(Object.fromEntries(declarations), null, 2) +
		' as const;\n',
);
for (const file of [
	'apps/documentation/src/app/content/api-signatures.generated.ts',
	'apps/documentation/src/app/content/generated/public-surface.generated.ts',
])
	writeFileSync(
		file,
		await format(readFileSync(file, 'utf8'), {
			filepath: file,
			...JSON.parse(readFileSync('.prettierrc.json', 'utf8')),
		}),
	);
