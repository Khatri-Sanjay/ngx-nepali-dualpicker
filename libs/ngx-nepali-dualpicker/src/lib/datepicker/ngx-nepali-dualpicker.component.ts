import type { CalendarCell } from './components/calendar-grid/calendar-cell.model';
import { createCalendarCell } from './components/calendar-grid/create-calendar-cell';
import { getCalendarDayState } from './state/calendar-day-state';
import { readSelectionValue, readSelectionText, normalizePickerSelection } from './state/selection-values';
import { CalendarGridComponent } from './components/calendar-grid/calendar-grid.component';
import { DateCellTemplateDirective } from './components/calendar-grid/date-cell-template.directive';
import type { DateSelectionPreset } from './state/datepicker-options.model';
import { getRangeConstraintError } from './state/range-constraints';
import { convertAdToBs, convertBsToAd } from '../core/calendar/date-conversion';
import type { DateObj as CalendarDate } from '../core/models/calendar-date.model';
import { MonthYearPanelComponent } from './components/month-year-panel/month-year-panel.component';
import { PickerDate as DateObj, toCalendarDate, toPickerDate } from './state/picker-date.adapter';
import type { PickerSelection } from './state/selection-state.model';
import { emptySelection, formatSelection } from './state/selection-state';
import { compileDateRestrictions, isCalendarDateValid } from './state/date-restrictions';
import { CalendarKeyboardCommand, getCalendarKeyboardCommand } from './keyboard/calendar-keyboard';
import { PickerPopupController } from './overlay/picker-popup.controller';
import {
	getMonthGrid,
	getYearOptions,
	getMonthLength,
	getDayIndex,
	fromDayIndex,
	shiftCalendarMonth,
	getCalendarWeekday,
} from '../core/calendar/calendar-operations';
import { PickerThemeController } from '../themes/picker-theme.controller';
import { cloneConfig } from '../configuration/merge-datepicker-config';
import { selectRangeEndpoint, toggleMultipleSelection, SelectionPolicy } from './state/selection-transitions';
import {
	Component,
	ContentChild,
	forwardRef,
	Input,
	OnInit,
	Output,
	EventEmitter,
	signal,
	ViewEncapsulation,
	ChangeDetectorRef,
	ElementRef,
	HostListener,
	AfterViewInit,
	ViewChild,
	computed,
	untracked,
	effect,
	OnDestroy,
	inject,
	Signal,
	PLATFORM_ID,
	ChangeDetectionStrategy,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl } from '@angular/forms';
import { DOCUMENT, isPlatformBrowser, NgClass } from '@angular/common';
import { PickerDateFormatter as DateFormatter } from './state/picker-date.adapter';
import { DaysMapping, MonthMapping } from '../core/locale/calendar-labels.model';
import { DatePickerValue } from './state/datepicker-value.type';
import type { DatePickerConfig } from '../configuration/datepicker-config.model';
import { DEFAULT_PICKER_CONFIG } from '../configuration/datepicker-config.defaults';
import type { CalendarSystem } from '../core/models/calendar-system.model';
import { DAYS_NAME, NEPALI_MONTHS_NAME, ENGLISH_MONTHS_NAME } from '../core/locale/calendar-labels';
import { NepaliNumeralPipe } from '../pipes/nepali-numeral.pipe';
import { DateConversionService } from '../services/date-conversion.service';
import { DatePickerConfigService } from '../configuration/datepicker-config.service';
import { DateCalculator } from '../core/calendar/date-calculator';
import { DateParser } from '../core/parsing/date-parser';

import { formatPickerDate } from '../core/formatting/format-picker-date';
import { formatDate } from '../core/formatting/format-date';
import { isEditableDateFormat } from '../core/formatting/date-formats';
import { FULL_WEEKDAY_NAMES } from '../core/locale/calendar-labels';
import { toNepaliNumerals } from '../core/locale/convert-numerals';
import { DatepickerIdService } from './accessibility/datepicker-id.service';
import { DATEPICKER_MESSAGES } from './accessibility/datepicker-messages';
import { validateDatePickerValue } from './validation/nepali-date.validator';
import { NG_VALIDATORS, AbstractControl, ValidationErrors, Validator } from '@angular/forms';

@Component({
	selector: 'ngx-nepali-dualpicker',
	standalone: true,
	imports: [NgClass, NepaliNumeralPipe, CalendarGridComponent, MonthYearPanelComponent],
	templateUrl: './ngx-nepali-dualpicker.component.html',
	styleUrls: ['./ngx-nepali-dualpicker.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [
		PickerThemeController,
		PickerPopupController,
		{ provide: NG_VALIDATORS, useExisting: forwardRef(() => NgxNepaliDualpicker), multi: true },
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => NgxNepaliDualpicker),
			multi: true,
		},
	],
	encapsulation: ViewEncapsulation.None,
	host: {
		'[class.ndp-disabled]': 'isDisabled()',
		'[class.ndp-readonly]': 'mergedConfig().readOnly',
		'[class.nepali-date-picker]': 'true',
		'[class.mobile-compact]': 'isMobileCompact()',
		'[class.dark-mode]': 'isDarkMode()',
		'[attr.dir]': 'direction()',
	},
})
export class NgxNepaliDualpicker implements ControlValueAccessor, Validator, OnInit, AfterViewInit, OnDestroy {
	protected readonly dateCellTemplate = signal<DateCellTemplateDirective | undefined>(undefined);
	@ContentChild(DateCellTemplateDirective) protected set projectedDateCellTemplate(
		value: DateCellTemplateDirective | undefined,
	) {
		this.dateCellTemplate.set(value);
	}
	private readonly automaticId = inject(DatepickerIdService).create();
	protected readonly inputId = computed(() => this.mergedConfig().id || this.automaticId);
	protected readonly popupId = computed(() => this.inputId() + '-calendar');
	protected readonly helpId = computed(() => this.inputId() + '-help');
	protected readonly errorId = computed(() => this.inputId() + '-error');
	protected readonly headingId = computed(() => this.inputId() + '-heading');
	protected readonly canEditInput = computed(
		() =>
			this.mergedConfig().allowTextInput &&
			!this.mergedConfig().readOnly &&
			isEditableDateFormat(this.mergedConfig().displayFormat),
	);
	protected readonly inputError = signal<{ type: string; message: string; value: string } | null>(null);
	protected readonly validationErrors = signal<ValidationErrors | null>(null);
	protected readonly displayedInputValue = computed(() =>
		this.canEditInput() && (this.isInputFocused() || this.inputError()) ? this.inputValue() : this.formattedDate(),
	);
	protected readonly validationMessage = computed(() => {
		const errors = this.validationErrors();
		const words = DATEPICKER_MESSAGES[this.mergedConfig().language];
		if (!errors || errors['nepaliDateInput']) return '';
		if (errors['nepaliDateRange']) return words.invalidRange;
		if (errors['nepaliDateRestricted']) return words.unavailable;
		if (errors['nepaliDateLimit']) return words.limit;
		return words.invalidDate;
	});
	protected readonly announcement = signal('');
	protected readonly selectionNotice = signal('');
	protected readonly words = computed(() => DATEPICKER_MESSAGES[this.mergedConfig().language]);
	private formatUiNumber(value: string | number): string {
		return this.mergedConfig().language === 'ne' ? toNepaliNumerals(value) : String(value);
	}
	protected readonly todayUnavailable = computed(() => !this.isDateSelectableByDate(this.getTodayDate()));
	protected readonly noAvailableDates = computed(
		() =>
			!this.calendarRows()
				.flat()
				.some((cell) => cell.day !== null && cell.selectable),
	);
	protected readonly selectionSummary = computed(() => {
		if (!this.multipleMode()) return '';
		const count = this.selectedDates().length;
		const limit = this.mergedConfig().multipleSelection.maxSelections;
		return `${this.formatUiNumber(count)} ${this.words().selectedCount}${limit === undefined ? '' : ` · ${this.words().maximum} ${this.formatUiNumber(limit)}`}`;
	});
	protected readonly periodLabel = computed(() => {
		const year = this.formatUiNumber(this.displayDate().year);
		return `${this.getCurrentMonthLabel()} ${year}, ${this.words().chooseMonthYear}`;
	});
	protected readonly effectiveAriaLabels = computed(() => {
		const labels = this.mergedConfig().ariaLabels;
		const localized = this.words();
		const resolve = (key: 'calendar' | 'clearDate' | 'previousMonth' | 'nextMonth' | 'today' | 'selectDate') => {
			const custom = labels[key]?.trim();
			return custom && custom !== DEFAULT_PICKER_CONFIG.ariaLabels[key] ? custom : localized[key];
		};
		const today = resolve('today');
		return {
			selectDate: resolve('selectDate'),
			calendar: resolve('calendar'),
			clearDate: resolve('clearDate'),
			previousMonth: resolve('previousMonth'),
			nextMonth: resolve('nextMonth'),
			today: today.includes(localized.today) ? today : `${localized.today}, ${today}`,
		};
	});
	protected readonly calendarHeading = computed(
		() =>
			formatDate(
				{ year: this.displayDate().year, month: this.displayDate().month + 1, day: 1 },
				'MMMM yyyy',
				this.mergedConfig().language,
				this.currentCalendarType(),
			) +
			' ' +
			this.currentCalendarType(),
	);
	protected readonly fullDayNames = computed(() => {
		const names = FULL_WEEKDAY_NAMES[this.mergedConfig().language];
		const offset = this.mergedConfig().firstDayOfWeek;
		return [...names.slice(offset), ...names.slice(0, offset)];
	});
	protected readonly formatDescription = computed(() => {
		const config = this.mergedConfig();
		const words = DATEPICKER_MESSAGES[config.language];
		const hints = [
			config.readOnly ? words.readOnly : '',
			config.allowTextInput && !isEditableDateFormat(config.displayFormat) ? words.displayOnly : '',
			words.format + ' ' + config.displayFormat + '.',
			config.inline ? '' : words.open,
			config.selectionMode === 'multiple' ? words.multiple : config.selectionMode === 'range' ? words.range : '',
			config.ariaLabels.keyboardHelp || (config.readOnly ? words.browse : words.keyboard),
		];
		return hints.filter(Boolean).join(' ');
	});
	private validatorChange = () => {};
	private opener?: HTMLElement;

	validate(control: AbstractControl): ValidationErrors | null {
		const config = this.mergedConfig();
		if (!config.validation.enabled) {
			this.validationErrors.set(null);
			return null;
		}
		const errors = this.inputError()
			? { nepaliDateInput: this.inputError() }
			: validateDatePickerValue(control.value, {
					...config,
					calendar: this.currentCalendarType(),
					selectionMode: this.modeState(),
				});
		this.validationErrors.set(errors);
		return errors;
	}
	registerOnValidatorChange(fn: () => void): void {
		this.validatorChange = fn;
	}

	@HostListener('focusout', ['$event'])
	onHostFocusOut(event: FocusEvent): void {
		if (event.relatedTarget && this.popupController.contains(event.relatedTarget as Node)) return;
		this.markAsTouched();
		if (this.isOpen()) this.close();
	}
	protected onPanelFocusOut(event: FocusEvent): void {
		if (!this.elementRef.nativeElement.contains(event.target as Node)) this.onHostFocusOut(event);
	}
	protected onPanelKeyDown(event: KeyboardEvent): void {
		if (!this.elementRef.nativeElement.contains(event.target as Node)) this.onKeyDown(event);
	}
	@ViewChild('inputContainer') private inputContainerRef?: ElementRef<HTMLDivElement>;
	@ViewChild(CalendarGridComponent) private calendarGrid?: CalendarGridComponent;
	@ViewChild(MonthYearPanelComponent) private monthYearPanel?: MonthYearPanelComponent;
	@ViewChild('periodToggle') private periodToggleRef?: ElementRef<HTMLButtonElement>;
	inputContainer = () => this.inputContainerRef;
	monthColumn = () => this.monthYearPanel?.monthColumnRef;
	yearColumn = () => this.monthYearPanel?.yearColumnRef;

	// Decorator inputs keep the distributed package compatible with Angular 17.0.
	private configState = signal<DatePickerConfig>({});
	config = this.configState.asReadonly();
	@Input('config') set configInput(value: DatePickerConfig | null | undefined) {
		this.configState.set(cloneConfig(value ?? {}));
	}
	private formControlState = signal<FormControl | undefined>(undefined);
	formControl = this.formControlState.asReadonly();
	@Input('formControl') set formControlInput(value: FormControl | undefined) {
		this.formControlState.set(value);
	}
	private placeholderState = signal<string | undefined>(undefined);
	placeholder = this.placeholderState.asReadonly();
	@Input('placeholder') set placeholderInput(value: string | undefined) {
		this.placeholderState.set(value);
	}
	private hasErrorState = signal(false);
	hasError = this.hasErrorState.asReadonly();
	@Input('hasError') set hasErrorInput(value: boolean) {
		this.hasErrorState.set(value);
	}

	@Output() dateSelected = new EventEmitter<DatePickerValue>();
	@Output() pickerOpened = new EventEmitter<void>();
	@Output() pickerClosed = new EventEmitter<void>();
	@Output() calendarTypeChanged = new EventEmitter<CalendarSystem>();
	@Output() parseError = new EventEmitter<{
		type: 'format' | 'validation' | 'range' | 'limit';
		message: string;
		value: string;
	}>();

	// Calendar type state
	currentCalendarType = signal<CalendarSystem>('BS');

	focusedDate = signal<DateObj | null>(null);
	todayBS: DateObj = { day: 0, month: 0, year: 0 };
	todayAD: DateObj = { day: 0, month: 0, year: 0 };
	private displayDate = signal<DateObj>({ day: 1, month: 0, year: 2000 });
	/** @deprecated Legacy zero-based snapshot. Assign a complete value instead of mutating fields. */
	get currentDisplayDate(): DateObj {
		return { ...this.displayDate() };
	}
	set currentDisplayDate(value: DateObj) {
		this.displayDate.set({ ...value });
	}

	private selectionState = signal<PickerSelection>(emptySelection());
	readonly selectedDate = computed(() =>
		this.selectionState().single ? Object.freeze({ ...this.selectionState().single! }) : null,
	);
	readonly selectedDates = computed(() =>
		Object.freeze(this.selectionState().multiple.map((date) => Object.freeze({ ...date }))),
	);
	readonly startDate = computed(() =>
		this.selectionState().start ? Object.freeze({ ...this.selectionState().start! }) : null,
	);
	readonly endDate = computed(() =>
		this.selectionState().end ? Object.freeze({ ...this.selectionState().end! }) : null,
	);
	hoverDate = signal<DateObj | null>(null);

	readonly formattedDate = computed(() => this.formattedSelection().display);
	inputValue = signal<string>('');
	private yearOptions = computed(() =>
		getYearOptions(
			this.currentCalendarType(),
			this.mergedConfig().bsYearRange,
			this.restrictions().min,
			this.restrictions().max,
		),
	);
	get years(): number[] {
		return [...this.yearOptions()];
	}
	isOpen = signal<boolean>(false);
	isTouched = signal<boolean>(false);
	showMonthYearPicker = signal<boolean>(false);
	isInputFocused = signal<boolean>(false);
	isDisabled = signal<boolean>(false);
	private popupController = inject(PickerPopupController);
	dropdownTop = this.popupController.top;
	dropdownLeft = this.popupController.left;
	dropdownWidth = this.popupController.width;
	protected readonly popupMaxHeight = this.popupController.maxHeight;
	protected readonly popupOpensTop = this.popupController.opensTop;

	private modeState = signal<'single' | 'range' | 'multiple'>('single');
	readonly rangeMode = computed(() => this.modeState() === 'range');
	readonly multipleMode = computed(() => this.modeState() === 'multiple');

	direction = signal<'ltr' | 'rtl'>('ltr');
	isMobileCompact = signal<boolean>(false);
	private themeController = inject(PickerThemeController);
	readonly isDarkMode = this.themeController.dark;

	readonly currentTheme = this.themeController.theme;

	private configService = inject(DatePickerConfigService);
	private platformId = inject(PLATFORM_ID);
	private document = inject(DOCUMENT);
	private isBrowser = isPlatformBrowser(this.platformId);

	mergedConfig = computed(() => {
		return this.configService.getMergedConfig(this.config());
	});

	private restrictions = computed(() =>
		compileDateRestrictions(this.mergedConfig(), this.currentCalendarType(), toCalendarDate(this.getTodayDate())),
	);
	private gridRows = computed(() =>
		getMonthGrid(
			this.displayDate().year,
			this.displayDate().month + 1,
			this.currentCalendarType(),
			this.mergedConfig().firstDayOfWeek,
		),
	);
	private formattedSelection = computed(() =>
		formatSelection(this.selectionState(), this.modeState(), this.dateFormatter, this.outputFormatter),
	);
	private lastModelValue: DatePickerValue = null;
	private previousConfig?: Required<DatePickerConfig>;
	private initialized = false;
	private restoringInputFocus = false;
	protected readonly calendarRows = computed(() =>
		this.gridRows().map((row) => row.map((day) => this.createCalendarCell(day))),
	);
	protected readonly tabStop = computed(() => {
		const focused = this.focusedDate(),
			display = this.displayDate(),
			cells = this.calendarRows().flat();
		if (
			focused &&
			focused.year === display.year &&
			focused.month === display.month &&
			cells.some((cell) => cell.day === focused.day)
		)
			return focused.day;
		return (
			cells.find((cell) => cell.selected)?.day ??
			cells.find((cell) => cell.day !== null && cell.selectable)?.day ??
			1
		);
	});
	showDayPicker = computed(() => !this.showMonthYearPicker());
	effectivePlaceholder = computed(() => this.placeholder() || this.mergedConfig().placeholder);

	currentMonthsMapping: Signal<MonthMapping> = computed(() => {
		return this.currentCalendarType() === 'BS' ? NEPALI_MONTHS_NAME : ENGLISH_MONTHS_NAME;
	});

	getCurrentMonthLabel(): string {
		const config = this.mergedConfig();
		const currentMonthMapping = this.currentMonthsMapping()[config.language];
		return currentMonthMapping?.[config.monthLabelFormat]?.[this.currentDisplayDate.month] ?? '—';
	}

	rotatedDayNames = computed(() => {
		const config = this.mergedConfig();
		const days = DAYS_NAME[config.language][config.weekdayLabelFormat];
		const offset = config.firstDayOfWeek;
		return [...days!.slice(offset), ...days!.slice(0, offset)];
	});

	get currentMonthData(): { [key: number]: (number | null)[] } {
		const rows = this.gridRows();
		return Object.fromEntries(Array.from({ length: 7 }, (_, column) => [column, rows.map((row) => row[column])]));
	}

	daysMapping: DaysMapping = DAYS_NAME;

	private resizeObserver?: ResizeObserver;

	private pendingTimers = new Set<ReturnType<typeof setTimeout>>();
	private destroyed = false;
	private schedule(callback: () => void, delay = 0): ReturnType<typeof setTimeout> | undefined {
		if (!this.isBrowser || this.destroyed) return undefined;
		const timer = setTimeout(() => {
			this.pendingTimers.delete(timer);
			if (!this.destroyed) callback();
		}, delay);
		this.pendingTimers.add(timer);
		return timer;
	}
	private writingValue = false;
	private propagateChange: (value: DatePickerValue) => void = () => undefined;
	private propagateTouch = () => {};

	dateFormatter: DateFormatter = (date: DateObj) => {
		const config = this.mergedConfig();
		const monthName = this.currentMonthsMapping()[config.language]?.short?.[date.month] ?? '';
		return formatPickerDate(this.toPublicDate(date), config.displayFormat, monthName);
	};

	outputFormatter: DateFormatter = (date) =>
		formatPickerDate(this.toPublicDate(date), this.mergedConfig().outputFormat);

	private toPublicDate(date: DateObj): DateObj {
		return toCalendarDate(date);
	}

	private toPickerDate(date: DateObj): DateObj {
		return toPickerDate(date);
	}

	constructor(
		private dateConversion: DateConversionService,
		private cdr: ChangeDetectorRef,
		private elementRef: ElementRef,
	) {
		this.initializeTodayDates();
		this.themeController.bind(this.mergedConfig);
		effect(
			() => {
				const config = this.mergedConfig();
				untracked(() => {
					if (this.initialized) this.reconcileConfiguration(config);
				});
			},
			{ allowSignalWrites: true },
		);
		effect(
			() => {
				const display = this.formattedDate();
				untracked(() => {
					if (!this.isInputFocused()) this.inputValue.set(display);
				});
			},
			{ allowSignalWrites: true },
		);
	}

	ngOnInit(): void {
		const config = this.mergedConfig();
		this.previousConfig = config;
		this.initialized = true;

		this.currentCalendarType.set(config.calendar || 'BS');

		this.initializeMode(config);
		this.setCurrentDate();

		this.checkMobileMode();

		this.cdr.markForCheck();
	}

	ngAfterViewInit(): void {
		if (!this.isBrowser) {
			return;
		}

		this.setupResizeObserver();
		this.cdr.markForCheck();
	}

	ngOnDestroy(): void {
		this.destroyed = true;
		this.cleanup();
	}

	private initializeTodayDates(): void {
		const todayAD = new Date();

		this.todayAD = {
			day: todayAD.getDate(),
			month: todayAD.getMonth(),
			year: todayAD.getFullYear(),
		};

		const todayBS = this.dateConversion.convertAdToBs(todayAD) as DateObj;
		this.todayBS = {
			day: todayBS.day,
			month: todayBS.month - 1,
			year: todayBS.year,
		};
	}

	toggleCalendarType(): void {
		const newType = this.currentCalendarType() === 'BS' ? 'AD' : 'BS';
		this.switchCalendarType(newType);
	}

	switchCalendarType(newType: CalendarSystem): void {
		if (this.isDisabled() || this.mergedConfig().readOnly) return;
		const config = this.mergedConfig();
		const oldType = this.currentCalendarType();

		if (oldType === newType) {
			return;
		}

		this.currentCalendarType.set(newType);

		if (config.convertOnCalendarChange && this.hasSelectedDates()) {
			this.convertDatesOnCalendarSwitch(newType);
		} else if (!config.convertOnCalendarChange) {
			this.clearSelectionState();
			this.formatValue();
		}

		this.setCurrentDate();

		this.calendarTypeChanged.emit(newType);

		this.cdr.markForCheck();
	}

	private hasSelectedDates(): boolean {
		if (this.multipleMode()) {
			return this.selectedDates().length > 0;
		} else if (this.rangeMode()) {
			return this.startDate() !== null || this.endDate() !== null;
		} else {
			return this.selectedDate() !== null;
		}
	}

	/**
	 * Convert selected dates when switching calendar types
	 */
	private convertDatesOnCalendarSwitch(toType: CalendarSystem): void {
		const convertDate = (date: DateObj | null): DateObj | null => {
			if (!date) return null;
			try {
				const input = this.toPublicDate(date);
				const converted = this.toPickerDate(
					(toType === 'AD'
						? this.dateConversion.convertBsToAd(input)
						: this.dateConversion.convertAdToBs(input)) as DateObj,
				);
				return this.isDateSelectableByDate(converted) ? converted : null;
			} catch (error) {
				console.error('Date conversion error:', error);
				return null;
			}
		};

		this.selectionState.update((state) => ({ ...state, single: convertDate(this.selectedDate()) }));
		const start = convertDate(this.startDate());
		this.selectionState.update((state) => ({ ...state, start: start }));
		this.selectionState.update((state) => ({ ...state, end: start ? convertDate(this.endDate()) : null }));
		this.selectionState.update((state) => ({
			...state,
			multiple: this.selectedDates()
				.map(convertDate)
				.filter((date): date is DateObj => date !== null),
		}));
		this.focusedDate.set(null);
		this.hoverDate.set(null);
		this.formatValue();
	}

	protected getTodayDate(): DateObj {
		return this.currentCalendarType() === 'BS' ? this.todayBS : this.todayAD;
	}

	private initializeMode(config: Required<DatePickerConfig>): void {
		this.modeState.set(config.selectionMode);
	}

	private setupResizeObserver(): void {
		if (this.isBrowser && typeof ResizeObserver !== 'undefined' && this.document.body) {
			this.resizeObserver = new ResizeObserver(() => {
				this.checkMobileMode();
			});
			this.resizeObserver.observe(this.document.body);
		}
	}

	private cleanup(): void {
		for (const timer of this.pendingTimers) clearTimeout(timer);
		this.pendingTimers.clear();
		this.popupController.detach();

		if (this.resizeObserver) {
			this.resizeObserver.disconnect();
		}
	}

	private checkMobileMode(): void {
		const config = this.mergedConfig();
		const width = this.isBrowser ? window.innerWidth : 1024;
		const isMobile = width <= 480;
		this.isMobileCompact.set(isMobile && config.mobilePresentation === 'bottom-sheet');
	}

	/**
	 * Set the current display date, respecting maxDate and minDate boundaries.
	 */
	protected setCurrentDate(): void {
		const state = this.selectionState();
		const selected = state.single ?? state.start ?? state.multiple[state.multiple.length - 1];
		if (selected) {
			this.currentDisplayDate = selected;
			return;
		}
		const today = this.getTodayDate(),
			date = toCalendarDate(today),
			bounds = this.restrictions();
		this.currentDisplayDate =
			bounds.max && DateCalculator.compareDates(date, bounds.max) > 0
				? toPickerDate(bounds.max)
				: bounds.min && DateCalculator.compareDates(date, bounds.min) < 0
					? toPickerDate(bounds.min)
					: today;
	}

	/**
	 * Populate years, clamped to minDate / maxDate if provided.
	 */
	populateYears(): void {
		/* @deprecated Year options are now derived from display/configuration state. */
	}

	setCurrentMonthData(): void {
		/* @deprecated The month grid is now computed; no manual synchronization is needed. */
	}

	private dateToDays(date: DateObj): number {
		return getDayIndex(toCalendarDate(date), this.currentCalendarType()) + 1;
	}

	selectDate(day: number): void {
		if (this.isDisabled() || this.mergedConfig().readOnly) return;
		const config = this.mergedConfig();

		if (!this.isDateSelectable(day)) {
			return;
		}

		const selected: DateObj = {
			year: this.currentDisplayDate.year,
			month: this.currentDisplayDate.month,
			day,
		};
		if (this.rangeMode() && this.startDate() && !this.endDate()) {
			const start = this.startDate()!;
			const [first, last] =
				this.dateToDays(start) <= this.dateToDays(selected) ? [start, selected] : [selected, start];
			if (!this.selectionPolicy(config).isRangeSelectable?.(first, last)) {
				const error = getRangeConstraintError(
					toCalendarDate(first),
					toCalendarDate(last),
					this.currentCalendarType(),
					config.rangeConstraints,
					(date) => this.restrictions().isSelectable(date),
				);
				const message =
					error?.reason === 'minDays'
						? this.words().rangeMinimum.replace('{count}', this.formatUiNumber(error.min!))
						: error?.reason === 'maxDays'
							? this.words().rangeMaximum.replace('{count}', this.formatUiNumber(error.max!))
							: this.words().rangeUnavailable;
				this.resetWithError('range', message, this.inputValue());
				return;
			}
		}

		if (this.multipleMode()) {
			if (!this.handleMultipleSelection(selected, config)) return;
		} else if (this.rangeMode()) {
			this.handleRangeSelection(selected, config);
		} else {
			this.handleSingleSelection(selected, config);
		}

		this.formatValue();
		this.markAsTouched();
		this.cdr.markForCheck();
	}

	private handleSingleSelection(selected: DateObj, config: Required<DatePickerConfig>): void {
		this.selectionState.update((state) => ({ ...state, single: selected }));

		if (config.closeOnSelection) {
			this.schedule(() => this.close(true, true), 150);
		}
	}

	private handleRangeSelection(selected: DateObj, config: Required<DatePickerConfig>): void {
		const range = selectRangeEndpoint(
			{ start: this.startDate(), end: this.endDate() },
			selected,
			this.selectionPolicy(config),
		);
		this.selectionState.update((state) => ({ ...state, start: range.start }));
		this.selectionState.update((state) => ({ ...state, end: range.end }));
		if (range.end && config.closeOnSelection) this.schedule(() => this.close(true, true), 150);
	}

	private handleMultipleSelection(selected: DateObj, config: Required<DatePickerConfig>): boolean {
		const current = this.selectedDates();
		const limit = config.multipleSelection.maxSelections;
		if (
			limit !== undefined &&
			current.length >= limit &&
			!current.some((date) => this.dateToDays(date) === this.dateToDays(selected))
		) {
			this.selectionNotice.set(this.words().limitReached);
			this.parseError.emit({ type: 'limit', message: this.words().limitReached, value: this.inputValue() });
			this.markAsTouched();
			return false;
		}
		this.selectionState.update((state) => ({
			...state,
			multiple: toggleMultipleSelection(this.selectedDates(), selected, this.selectionPolicy(config)),
		}));
		return true;
	}

	clearSelection(): void {
		if (this.isDisabled() || this.mergedConfig().readOnly) return;
		this.clearSelectionState();
		this.setCurrentDate();

		this.formatValue();

		this.markAsTouched();
		this.cdr.markForCheck();
	}

	/** Apply an application-defined shortcut transactionally, using the current mode and restrictions. */
	selectPreset(preset: DateSelectionPreset): void {
		if (this.isDisabled() || this.mergedConfig().readOnly) return;
		const config = {
			...this.mergedConfig(),
			calendar: this.currentCalendarType(),
			selectionMode: this.modeState(),
		};
		try {
			const todayAd = DateParser.getCurrentDate();
			const today = config.calendar === 'BS' ? (convertAdToBs(todayAd) as CalendarDate) : todayAd;
			const value =
				typeof preset.value === 'function'
					? preset.value({
							calendar: config.calendar,
							today: Object.freeze(today),
							selectionMode: config.selectionMode,
							outputFormat: config.outputFormat,
						})
					: preset.value;
			if (validateDatePickerValue(value, { ...config, validation: { requireCompleteRange: true } })) {
				this.resetWithError('validation', 'Preset violates date or range restrictions.', preset.label);
				return;
			}
			const next = readSelectionValue(
				value,
				config.selectionMode,
				(item) => this.parseModelDate(item),
				this.selectionPolicy(),
			);
			this.selectionState.set(next);
			this.setCurrentDate();
			this.formatValue();
			this.markAsTouched();
			if (config.closeOnSelection) this.schedule(() => this.close(true, true), 150);
		} catch {
			this.resetWithError('validation', 'Preset could not be resolved.', preset.label);
		}
	}

	private clearSelectionState(): void {
		this.selectionState.set(emptySelection());
		this.hoverDate.set(null);
		this.inputValue.set('');
	}

	private selectionPolicy(config = this.mergedConfig()): SelectionPolicy<DateObj> {
		return {
			key: (date) => this.dateToDays(date),
			isSelectable: (date) => this.isDateSelectableByDate(date),
			maxSelections: config.multipleSelection.maxSelections,
			isRangeSelectable: (start, end) =>
				!getRangeConstraintError(
					toCalendarDate(start),
					toCalendarDate(end),
					this.currentCalendarType(),
					config.rangeConstraints,
					(date) => this.restrictions().isSelectable(date),
				),
		};
	}

	isDateSelectable(day: number): boolean {
		const dateToCheck: DateObj = {
			year: this.currentDisplayDate.year,
			month: this.currentDisplayDate.month,
			day,
		};

		return this.isDateSelectableByDate(dateToCheck);
	}

	private isDateSelectableByDate(dateToCheck: DateObj): boolean {
		return this.restrictions().isSelectable(toCalendarDate(dateToCheck));
	}

	private parseDate(date: Date | string | { year: number; month: number; day: number }): DateObj {
		const parsed =
			date instanceof Date && this.currentCalendarType() === 'BS'
				? (this.dateConversion.convertAdToBs(date) as DateObj)
				: typeof date === 'string'
					? DateParser.parseByFormat(date, 'yyyy-MM-dd')
					: DateParser.parseToDateObj(date);
		if (!parsed) throw new Error('Invalid date format');
		const result = this.toPickerDate(parsed);
		if (!this.validateParsedDate(result)) throw new Error('Invalid calendar date');
		return result;
	}

	isDateSelected(day: number): boolean {
		return this.dayState(day).selected;
	}

	isDateInRange(day: number): boolean {
		return this.dayState(day).inRange;
	}

	isRangeStart(day: number): boolean {
		return this.dayState(day).start;
	}

	isRangeEnd(day: number): boolean {
		return this.dayState(day).end;
	}

	isDateInHoverRange(day: number): boolean {
		return this.dayState(day).inHover;
	}

	formatValue(): void {
		this.selectionNotice.set('');
		const hadError = this.inputError() !== null;
		this.inputError.set(null);
		const formatted = this.formattedSelection();
		this.inputValue.set(formatted.display);
		if (!this.writingValue) this.publishValue(formatted.value);
		if (hadError) this.validatorChange();
	}

	onFocus(): void {
		this.isInputFocused.set(true);
	}

	onBlur(): void {
		this.markAsTouched();
		this.isInputFocused.set(false);

		if (this.canEditInput() && this.inputValue() !== this.formattedDate()) {
			this.parseManualInput();
		} else {
			this.inputValue.set(this.formattedDate());
			if (this.inputError()) {
				this.inputError.set(null);
				this.validatorChange();
			}
		}

		this.cdr.markForCheck();
	}

	onInputChange(event: Event): void {
		if (this.isDisabled() || this.mergedConfig().readOnly) return;
		if (!this.canEditInput()) {
			event.preventDefault();
			return;
		}

		const input = event.target as HTMLInputElement;
		this.inputValue.set(input.value);
	}

	private parseManualInput(): void {
		if (this.isDisabled() || !this.canEditInput()) return;
		const value = this.inputValue();
		if (value === this.formattedDate()) {
			if (this.inputError()) {
				this.inputError.set(null);
				this.validatorChange();
			}
			return;
		}
		const result = readSelectionText(
			value,
			this.modeState(),
			(text) => {
				const date = DateParser.parseByFormat(text, this.mergedConfig().displayFormat);
				return date ? toPickerDate(date) : null;
			},
			this.selectionPolicy(),
		);
		if (!result.ok) {
			this.resetWithError(result.error.type, result.error.message, value);
			return;
		}
		this.selectionState.set(result.selection);
		this.setCurrentDate();
		this.formatValue();
	}

	private resetWithError(type: 'format' | 'validation' | 'range' | 'limit', message: string, value: string): void {
		if (this.mergedConfig().language === 'ne' && type !== 'range' && type !== 'limit') {
			const words = DATEPICKER_MESSAGES.ne;
			message = type === 'validation' ? words.unavailable : words.invalidDate;
		}
		this.inputError.set({ type, message, value });
		this.parseError.emit({ type, message, value });
		this.validatorChange();
	}

	private validateParsedDate(date: DateObj): boolean {
		return isCalendarDateValid(toCalendarDate(date), this.currentCalendarType());
	}

	onDateHover(day: number): void {
		if (this.isDisabled() || this.mergedConfig().readOnly) return;
		const date = { ...this.currentDisplayDate, day };
		const start = this.startDate();
		const invalidRange =
			start &&
			!this.endDate() &&
			!this.selectionPolicy().isRangeSelectable?.(
				this.dateToDays(start) > this.dateToDays(date) ? date : start,
				this.dateToDays(start) > this.dateToDays(date) ? start : date,
			);
		if (!this.isDateSelectable(day) || invalidRange) {
			this.onDateLeave();
			return;
		}
		if (this.rangeMode() && this.startDate() && !this.endDate()) {
			this.hoverDate.set({
				year: this.currentDisplayDate.year,
				month: this.currentDisplayDate.month,
				day,
			});
			this.cdr.markForCheck();
		}
	}

	onDateLeave(): void {
		this.hoverDate.set(null);
		this.cdr.markForCheck();
	}

	selectToday(): void {
		if (this.isDisabled() || this.mergedConfig().readOnly || this.todayUnavailable()) return;
		this.closeMonthYearPicker();
		const today = this.getTodayDate();

		this.currentDisplayDate = { ...today };

		this.selectDate(today.day);
	}

	protected readonly disabledMonths = computed(() =>
		Array.from({ length: 12 }, (_, month) => month).filter(
			(month) => !this.isDisplayMonthWithinBounds(this.currentDisplayDate.year, month),
		),
	);
	private isDisplayMonthWithinBounds(year: number, month: number): boolean {
		if (!this.years.includes(year)) return false;
		const { min, max } = this.restrictions();
		const period = year * 12 + month;
		return (!min || period >= min.year * 12 + min.month - 1) && (!max || period <= max.year * 12 + max.month - 1);
	}
	canNavigateMonth(offset: -1 | 1): boolean {
		const month = this.currentDisplayDate.month + offset;
		const year = this.currentDisplayDate.year + (month < 0 ? -1 : month > 11 ? 1 : 0);
		return this.isDisplayMonthWithinBounds(year, (month + 12) % 12);
	}

	previousMonth(): void {
		this.shiftDisplayMonth(-1);
	}

	nextMonth(): void {
		this.shiftDisplayMonth(1);
	}

	private shiftDisplayMonth(offset: -1 | 1): void {
		if (this.isDisabled() || !this.canNavigateMonth(offset)) return;
		const month = this.currentDisplayDate.month + offset;
		this.currentDisplayDate = {
			...this.currentDisplayDate,
			year: this.currentDisplayDate.year + Math.floor(month / 12),
			month: (month + 12) % 12,
		};

		this.closeMonthYearPicker();
	}

	toggleMonthYearPicker(): void {
		if (this.isDisabled()) return;
		this.showMonthYearPicker.set(!this.showMonthYearPicker());
		if (this.showMonthYearPicker()) {
			this.scrollToSelected();
		}
	}

	closeMonthYearPicker(): void {
		this.showMonthYearPicker.set(false);
	}

	selectMonth(monthIndex: number): void {
		if (this.isDisabled() || !Number.isInteger(monthIndex) || monthIndex < 0 || monthIndex > 11) return;
		if (!this.isDisplayMonthWithinBounds(this.currentDisplayDate.year, monthIndex)) return;
		this.currentDisplayDate = { ...this.currentDisplayDate, month: monthIndex };

		this.closeMonthYearPicker();
		this.schedule(() => this.periodToggleRef?.nativeElement.focus(), 0);
		this.cdr.markForCheck();
	}

	selectYear(year: number): void {
		if (this.isDisabled() || !this.years.includes(year)) return;
		const months = Array.from({ length: 12 }, (_, month) => month).filter((month) =>
			this.isDisplayMonthWithinBounds(year, month),
		);
		if (!months.length) return;
		const month = Math.max(months[0], Math.min(months[months.length - 1], this.currentDisplayDate.month));
		this.currentDisplayDate = { ...this.currentDisplayDate, year, month };

		this.cdr.markForCheck();
	}

	private scrollToSelected(): void {
		this.schedule(() => this.monthYearPanel?.scrollToSelected(), 0);
	}

	toggleMode(selectionMode: 'single' | 'range' | 'multiple'): void {
		if (this.isDisabled() || this.mergedConfig().readOnly) return;
		this.modeState.set(selectionMode);

		this.clearSelectionState();

		this.formatValue();
		this.cdr.markForCheck();
	}

	toggleOpen(): void {
		const config = this.mergedConfig();

		if (config.inline || this.isDisabled()) return;

		if (this.isOpen()) {
			this.close();
		} else {
			this.open();
		}
	}

	private updateDropdownPosition(): void {
		if (!this.isOpen() || this.mergedConfig().inline) return;
		this.popupController.update(this.inputContainer()?.nativeElement, this.mergedConfig().popupPosition);
	}

	open(): void {
		const config = this.mergedConfig();

		if (config.inline || this.isDisabled()) return;

		if (this.isOpen()) return;
		if (this.restoringInputFocus) return;
		const active = this.document.activeElement as HTMLElement | null;
		this.opener =
			active && this.elementRef.nativeElement.contains(active)
				? active
				: (this.inputContainer()?.nativeElement.querySelector('input') ?? undefined);
		this.isOpen.set(true);
		this.popupController.attach(
			() => this.inputContainer()?.nativeElement,
			() => this.mergedConfig().popupPosition,
			() => this.close(),
		);
		this.pickerOpened.emit();
		this.updateDropdownPosition();
		this.initializeFocusedDate();
		this.schedule(() => {
			// Render, measure and reveal before moving keyboard focus into the panel.
			this.cdr.detectChanges();
			this.updateDropdownPosition();
			this.cdr.detectChanges();
			this.calendarGrid?.focusDay(this.tabStop());
		}, 0);

		this.cdr.markForCheck();
	}

	close(markTouched = true, restoreFocus = false): void {
		const wasOpen = this.isOpen();
		this.isOpen.set(false);
		this.popupController.detach();
		this.focusedDate.set(null);
		this.closeMonthYearPicker();
		this.hoverDate.set(null);
		if (wasOpen) {
			this.pickerClosed.emit();
			if (markTouched) this.markAsTouched();
		}
		this.cdr.markForCheck();
		if (wasOpen && restoreFocus && this.isBrowser) {
			this.restoringInputFocus = true;
			try {
				this.opener?.focus();
			} finally {
				this.restoringInputFocus = false;
			}
		}
	}

	public setDate(date: string | { year: number; month: number; day: number }): void {
		const parsed = this.parseDate(date);
		if (!this.isDateSelectableByDate(parsed)) return;
		const selectionMode = this.modeState();
		const value =
			selectionMode === 'multiple' ? [parsed] : selectionMode === 'range' ? { start: parsed, end: null } : parsed;
		this.selectionState.set(readSelectionValue(value, selectionMode, () => parsed, this.selectionPolicy()));
		this.currentDisplayDate = parsed;
		this.formatValue();
	}

	private parseModelDate(value: unknown): DateObj {
		if (typeof value === 'string') {
			const parsed = DateParser.parseByFormat(value, this.mergedConfig().outputFormat);
			if (!parsed) throw new Error('Invalid form date format');
			return { ...parsed, month: parsed.month - 1 };
		}
		if (value instanceof Date) return this.parseDate(value);
		if (
			value !== null &&
			typeof value === 'object' &&
			'year' in value &&
			typeof value.year === 'number' &&
			'month' in value &&
			typeof value.month === 'number' &&
			'day' in value &&
			typeof value.day === 'number'
		) {
			return this.parseDate({ year: value.year, month: value.month, day: value.day });
		}
		throw new Error('Unsupported form date value');
	}

	writeValue(value: unknown): void {
		if (!this.initialized) {
			this.currentCalendarType.set(this.mergedConfig().calendar);
			this.initializeMode(this.mergedConfig());
		}
		this.writingValue = true;
		try {
			this.selectionState.set(
				readSelectionValue(
					value,
					this.modeState(),
					(date) => this.parseModelDate(date),
					this.selectionPolicy(),
				),
			);
		} catch (error) {
			this.clearSelectionState();
			console.warn('NgxNepaliDualpicker: writeValue() ignored an invalid date value.', error);
		} finally {
			this.formatValue();
			this.setCurrentDate();
			this.lastModelValue = this.formattedSelection().value;
			this.writingValue = false;
			this.cdr.markForCheck();
		}
	}

	registerOnChange(fn: (value: DatePickerValue) => void): void {
		this.propagateChange = fn;
	}

	registerOnTouched(fn: () => void): void {
		this.propagateTouch = fn;
	}

	setDisabledState(isDisabled: boolean): void {
		this.isDisabled.set(isDisabled);
		if (isDisabled) this.close(false);
	}

	private markAsTouched(): void {
		this.isTouched.set(true);
		this.propagateTouch();
	}

	isDateFocused(day: number): boolean {
		return this.dayState(day).focused;
	}

	/** @deprecated Active-popup listeners are now attached only while open. */
	onDocumentClick(event: Event): void {
		const target = event.target as HTMLElement;
		const isInsideComponent = this.elementRef.nativeElement.contains(target);

		if (!isInsideComponent && this.isOpen()) {
			this.close();
		}

		if (!isInsideComponent) {
			this.closeMonthYearPicker();
		}
	}

	@HostListener('window:resize')
	onWindowResize(): void {
		if (!this.isBrowser) {
			return;
		}

		this.checkMobileMode();
		this.updateDropdownPosition();
	}

	/** @deprecated Active-popup listeners capture nested scrolling. */
	onWindowScroll(): void {
		if (!this.isBrowser) {
			return;
		}

		this.updateDropdownPosition();
	}

	@HostListener('keydown', ['$event'])
	onKeyDown(event: KeyboardEvent): void {
		if (this.isDisabled()) return;
		if (event.key === 'Escape' && this.showMonthYearPicker()) {
			event.preventDefault();
			event.stopPropagation();
			this.closeMonthYearPicker();
			this.periodToggleRef?.nativeElement.focus();
			return;
		}
		const target = event.target as HTMLElement | null;
		if (target?.tagName === 'INPUT' && event.key === 'ArrowDown' && !event.ctrlKey && !event.metaKey) {
			event.preventDefault();
			this.open();
			return;
		}
		if (target?.tagName === 'INPUT' && this.canEditInput() && event.key === 'Enter') {
			event.preventDefault();
			this.parseManualInput();
			if (!this.inputError()) this.close(true, true);
			return;
		}
		if (target?.closest('ndp-calendar-grid')) return;
		if (
			event.key !== 'Escape' &&
			target?.closest('button,select,textarea,a[href],[contenteditable="true"],.month-item,.year-item')
		)
			return;
		if (target?.tagName === 'INPUT' && this.canEditInput() && event.key !== 'Escape') return;
		if (!this.isOpen() && !this.mergedConfig().inline) {
			if (event.key === 'Enter' || event.key === ' ') {
				event.preventDefault();
				this.open();
				this.initializeFocusedDate();
			}
			return;
		}
		const command = getCalendarKeyboardCommand(event);
		if (command) {
			event.preventDefault();
			this.onCalendarKey(command);
		}
	}

	private initializeFocusedDate(): void {
		const selected = this.selectedDate() ?? this.selectedDates()[0] ?? null;
		const start = this.startDate();

		if (selected) {
			this.focusedDate.set(selected);
		} else if (start) {
			this.focusedDate.set(start);
		} else {
			const display = this.displayDate();
			this.focusedDate.set({
				...display,
				day: this.isDateSelectable(display.day) ? display.day : this.tabStop(),
			});
		}

		const focused = this.focusedDate();
		if (focused) {
			this.currentDisplayDate = { ...focused };
		}
	}

	private setFocusedDate(date: DateObj): void {
		if (!this.validateParsedDate(date)) return;
		const value = toCalendarDate(date),
			bounds = this.restrictions();
		if (
			(bounds.min && DateCalculator.compareDates(value, bounds.min) < 0) ||
			(bounds.max && DateCalculator.compareDates(value, bounds.max) > 0)
		)
			return;
		this.focusedDate.set({ ...date });
		this.currentDisplayDate = { ...date };
		this.schedule(() => this.calendarGrid?.focusDay(date.day), 0);
	}

	private selectFocusedDate(): void {
		const focused = this.focusedDate();
		if (focused && this.isDateSelectableByDate(focused)) {
			this.selectDate(focused.day);
		}
	}
	private publishValue(value: DatePickerValue): void {
		this.lastModelValue = value;
		this.propagateChange(value);
		this.dateSelected.emit(value);
		const display = formatSelection(
			this.selectionState(),
			this.modeState(),
			(date) =>
				formatDate(toCalendarDate(date), 'fullDate', this.mergedConfig().language, this.currentCalendarType()),
			this.outputFormatter,
		).display;
		const words = DATEPICKER_MESSAGES[this.mergedConfig().language];
		this.announcement.set(
			display ? words.selected + ' ' + display + ' ' + this.currentCalendarType() : words.cleared,
		);
	}
	private dayState(day: number) {
		return getCalendarDayState(
			{ ...this.displayDate(), day },
			this.selectionState(),
			this.modeState(),
			this.hoverDate(),
			this.focusedDate(),
			this.getTodayDate(),
			(date) => this.dateToDays(date),
		);
	}
	private createCalendarCell(day: number | null): CalendarCell {
		const cell = createCalendarCell(day, (value) => ({
			state: this.dayState(value),
			selectable: this.isDateSelectable(value),
			language: this.mergedConfig().language,
			accessibleLabel:
				this.effectiveAriaLabels().selectDate +
				' ' +
				formatDate(
					{ year: this.displayDate().year, month: this.displayDate().month + 1, day: value },
					'EEEE, d MMMM yyyy',
					this.mergedConfig().language,
					this.currentCalendarType(),
				) +
				' ' +
				this.currentCalendarType(),
		}));
		if (day === null) return cell;
		const date = Object.freeze(toCalendarDate({ ...this.displayDate(), day }));
		const calendar = this.currentCalendarType();
		const secondaryCalendar = calendar === 'BS' ? 'AD' : 'BS';
		let secondaryDate: CalendarDate | null = null;
		try {
			secondaryDate = Object.freeze(
				(calendar === 'BS' ? convertBsToAd(date) : convertAdToBs(date)) as CalendarDate,
			);
		} catch {
			/* Conversion is unavailable outside the common AD/BS range. */
		}
		const showSecondary = this.mergedConfig().showSecondaryDate && secondaryDate;
		return {
			...cell,
			context: {
				$implicit: date,
				date,
				calendar,
				secondaryDate,
				secondaryCalendar,
				selected: cell.selected,
				disabled: !cell.selectable || this.isDisabled() || this.mergedConfig().readOnly,
				today: cell.today,
			},
			secondaryLabel: showSecondary
				? formatDate(secondaryDate, 'MMM d', this.mergedConfig().language, secondaryCalendar)
				: '',
			accessibleLabel:
				cell.accessibleLabel +
				(showSecondary
					? '; ' +
						formatDate(secondaryDate, 'fullDate', this.mergedConfig().language, secondaryCalendar) +
						' ' +
						secondaryCalendar
					: ''),
		};
	}
	protected onCalendarFocus(day: number): void {
		this.focusedDate.set({ ...this.displayDate(), day });
	}
	protected onCalendarKey(command: CalendarKeyboardCommand): void {
		if (this.isDisabled()) return;
		const focused = this.focusedDate() ?? { ...this.displayDate(), day: 1 };
		const calendar = this.currentCalendarType();
		const date = toCalendarDate(focused);
		switch (command.type) {
			case 'select':
				if (!this.focusedDate()) this.focusedDate.set(focused);
				this.selectFocusedDate();
				return;
			case 'dismiss':
				this.close(true, true);
				return;
			case 'calendar':
				this.switchCalendarType(command.calendar);
				return;
			case 'today':
				this.setFocusedDate({ ...this.getTodayDate() });
				return;
			case 'days':
				this.setFocusedDate(toPickerDate(fromDayIndex(getDayIndex(date, calendar) + command.offset, calendar)));
				return;
			case 'months':
				this.setFocusedDate(toPickerDate(shiftCalendarMonth(date, command.offset, calendar)));
				return;
			case 'boundary': {
				if (command.week) {
					const offset = (getCalendarWeekday(date, calendar) - this.mergedConfig().firstDayOfWeek + 7) % 7;
					this.setFocusedDate(
						toPickerDate(
							fromDayIndex(getDayIndex(date, calendar) + (command.end ? 6 - offset : -offset), calendar),
						),
					);
					return;
				}
				const month = command.year ? (command.end ? 12 : 1) : date.month;
				this.setFocusedDate(
					toPickerDate({
						year: date.year,
						month,
						day: command.end ? getMonthLength(date.year, month, calendar) : 1,
					}),
				);
			}
		}
	}
	private reconcileConfiguration(config: Required<DatePickerConfig>): void {
		const previous = this.previousConfig;
		if (previous === config) return;
		this.previousConfig = config;
		this.hoverDate.set(null);
		const before = JSON.stringify(this.lastModelValue);
		let resetView = false;
		this.writingValue = true;
		try {
			if (previous?.calendar !== config.calendar && this.currentCalendarType() !== config.calendar) {
				resetView = true;
				this.currentCalendarType.set(config.calendar);
				if (config.convertOnCalendarChange && this.hasSelectedDates())
					this.convertDatesOnCalendarSwitch(config.calendar);
				else this.clearSelectionState();
				this.focusedDate.set(null);
			}
			if (previous?.selectionMode !== config.selectionMode && this.modeState() !== config.selectionMode) {
				resetView = true;
				this.initializeMode(config);
				this.clearSelectionState();
			}
			this.selectionState.set(
				normalizePickerSelection(this.selectionState(), this.modeState(), this.selectionPolicy()),
			);
			if (resetView) this.setCurrentDate();
			else {
				// Cosmetic changes preserve browsing; new bounds only move an excluded month.
				const { min, max } = this.restrictions();
				const visibleMonth = this.currentDisplayDate.year * 12 + this.currentDisplayDate.month;
				const boundary =
					min && visibleMonth < min.year * 12 + min.month - 1
						? min
						: max && visibleMonth > max.year * 12 + max.month - 1
							? max
							: null;
				if (boundary) {
					this.currentDisplayDate = toPickerDate(boundary);
					this.focusedDate.set(null);
				}
			}
			this.formatValue();
			if (config.inline && this.isOpen()) this.close(false);
		} finally {
			this.writingValue = false;
		}
		const value = this.formattedSelection().value;
		if (before !== JSON.stringify(value)) this.publishValue(value);
		this.validatorChange();
		this.checkMobileMode();
		if (this.isOpen() && !config.inline) this.updateDropdownPosition();
	}
}
