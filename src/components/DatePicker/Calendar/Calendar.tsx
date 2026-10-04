import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { YEARS_PER_PAGE } from "../DatePicker.constants";
import type { DatePickerTexts, WeekDay } from "../DatePickerProps";
import { useCalendarFormatters } from "../hooks/useCalendarFormatters";
import {
  addMonths,
  addYears,
  capitalize,
  clampDate,
  compareMonths,
  isOutOfRange,
  isSameDay,
  setMonth,
  startOfDay,
} from "../dateUtils";
import type { CalendarView } from "./Calendar.types";
import { CalendarHeader } from "./CalendarHeader";
import { DaysView } from "./DaysView";
import { MonthsView } from "./MonthsView";
import { YearsView } from "./YearsView";
import styles from "./Calendar.module.css";

interface CalendarProps {
  value: Date | null;
  minDate?: Date;
  maxDate?: Date;
  isDateDisabled?: (date: Date) => boolean;
  locale: string;
  weekStartsOn: WeekDay;
  texts: DatePickerTexts;
  /** Сразу перевести фокус в календарь (открыли с клавиатуры). */
  autoFocus?: boolean;
  onSelect: (date: Date) => void;
  /** Escape в виде дней. */
  onClose?: () => void;
}

export function Calendar({
  value,
  minDate,
  maxDate,
  isDateDisabled,
  locale,
  weekStartsOn,
  texts,
  autoFocus = false,
  onSelect,
  onClose,
}: CalendarProps): React.ReactNode {
  const rootRef = useRef<HTMLDivElement>(null);
  const formatters = useCalendarFormatters(locale);

  const [today] = useState(() => startOfDay(new Date()));
  const [view, setView] = useState<CalendarView>("days");
  // Одна дата описывает и клавиатурный курсор, и показанный месяц/год/страницу лет.
  const [focusedDate, setFocusedDate] = useState(
    () => value ?? clampDate(today, minDate, maxDate),
  );

  // Значение поменялось снаружи (например, дату допечатали в поле) — показываем её.
  const [syncedValue, setSyncedValue] = useState(value);
  if (!isSameDay(syncedValue, value)) {
    setSyncedValue(value);
    if (value) {
      setFocusedDate(value);
      setView("days");
    }
  }

  // Счётчик запросов фокуса. DOM-фокус переводим, только когда пользователь уже
  // работает с календарём с клавиатуры; при работе мышью фокус остаётся в поле.
  const [focusRequest, setFocusRequest] = useState(autoFocus ? 1 : 0);
  useEffect(() => {
    if (focusRequest === 0) return;
    rootRef.current
      ?.querySelector<HTMLElement>('[data-focus-target="true"]')
      ?.focus();
  }, [focusRequest]);

  const keepFocusIn = (container: Element) => {
    if (container.contains(document.activeElement)) {
      setFocusRequest((count) => count + 1);
    }
  };

  const year = focusedDate.getFullYear();
  const pageStart = Math.floor(year / YEARS_PER_PAGE) * YEARS_PER_PAGE;
  const pageEnd = pageStart + YEARS_PER_PAGE - 1;
  const minYear = minDate?.getFullYear();
  const maxYear = maxDate?.getFullYear();
  const monthName = capitalize(formatters.month.format(focusedDate));

  const isSelectable = (date: Date) =>
    !isOutOfRange(date, minDate, maxDate) && !isDateDisabled?.(date);
  const isYearDisabled = (candidate: number) =>
    (minYear !== undefined && candidate < minYear) ||
    (maxYear !== undefined && candidate > maxYear);

  const navigation = {
    days: {
      prevLabel: texts.prevMonth,
      nextLabel: texts.nextMonth,
      isPrevDisabled: !!minDate && compareMonths(focusedDate, minDate) <= 0,
      isNextDisabled: !!maxDate && compareMonths(focusedDate, maxDate) >= 0,
      shift: (direction: number) => addMonths(focusedDate, direction),
    },
    months: {
      prevLabel: texts.prevYear,
      nextLabel: texts.nextYear,
      isPrevDisabled: minYear !== undefined && year <= minYear,
      isNextDisabled: maxYear !== undefined && year >= maxYear,
      shift: (direction: number) => addYears(focusedDate, direction),
    },
    years: {
      prevLabel: texts.prevYears,
      nextLabel: texts.nextYears,
      isPrevDisabled: minYear !== undefined && pageStart <= minYear,
      isNextDisabled: maxYear !== undefined && pageEnd >= maxYear,
      shift: (direction: number) =>
        addYears(focusedDate, direction * YEARS_PER_PAGE),
    },
  }[view];

  const moveTo = (date: Date) =>
    setFocusedDate(clampDate(date, minDate, maxDate));

  // Месяц и год выбираются независимо: повторный клик возвращает к дням.
  const handleToggleView = (target: Exclude<CalendarView, "days">) => {
    setView(view === target ? "days" : target);
  };

  const handleMoveFocus = (date: Date, container: Element) => {
    keepFocusIn(container);
    moveTo(date);
  };

  const handleMonthSelect = (month: number, container: Element) => {
    keepFocusIn(container);
    moveTo(setMonth(focusedDate, year, month));
    setView("days");
  };

  const handleYearSelect = (nextYear: number, container: Element) => {
    keepFocusIn(container);
    moveTo(setMonth(focusedDate, nextYear, focusedDate.getMonth()));
    setView("days");
  };

  // Из видов месяцев/лет Escape возвращает к дням, из дней — закрывает.
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    event.stopPropagation();
    if (view === "days") {
      onClose?.();
    } else {
      keepFocusIn(event.currentTarget);
      setView("days");
    }
  };

  return (
    <div ref={rootRef} className={styles.calendar} onKeyDown={handleKeyDown}>
      <CalendarHeader
        view={view}
        monthName={monthName}
        year={year}
        announcement={
          view === "years"
            ? `${pageStart} – ${pageEnd}`
            : `${monthName} ${year}`
        }
        texts={texts}
        prevLabel={navigation.prevLabel}
        nextLabel={navigation.nextLabel}
        isPrevDisabled={navigation.isPrevDisabled}
        isNextDisabled={navigation.isNextDisabled}
        onToggleView={handleToggleView}
        onShift={(direction) => moveTo(navigation.shift(direction))}
      />

      {view === "days" && (
        <DaysView
          focusedDate={focusedDate}
          value={value}
          today={today}
          weekStartsOn={weekStartsOn}
          formatters={formatters}
          label={`${monthName} ${year}`}
          isSelectable={isSelectable}
          onSelect={onSelect}
          onMoveFocus={handleMoveFocus}
        />
      )}
      {view === "months" && (
        <MonthsView
          year={year}
          focusedMonth={focusedDate.getMonth()}
          value={value}
          minDate={minDate}
          maxDate={maxDate}
          formatters={formatters}
          onSelect={handleMonthSelect}
        />
      )}
      {view === "years" && (
        <YearsView
          pageStart={pageStart}
          focusedYear={year}
          selectedYear={value?.getFullYear()}
          currentYear={today.getFullYear()}
          isYearDisabled={isYearDisabled}
          onSelect={handleYearSelect}
        />
      )}
    </div>
  );
}
