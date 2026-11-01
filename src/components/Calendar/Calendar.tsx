import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import cx from "clsx";
import { Button } from "../Button";
import { useLocale } from "../../locale";
import type { CalendarProps } from "./Calendar.types";
import {
  addDays,
  addMonths,
  clampDate,
  getMonthWeeks,
  isOutsideRange,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
} from "./Calendar.utils";
import * as s from "./Calendar.css";

function CalendarIcon() {
  return (
    <svg
      className={s.icon}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M7 2v6M17 2v6M3 11h18" />
    </svg>
  );
}

function Chevron({ next = false }: { next?: boolean }) {
  return (
    <svg
      className={cx(s.icon, s.chevron)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path d={next ? "m9 4 9 8-9 8" : "m15 4-9 8 9 8"} />
    </svg>
  );
}

export function Calendar({
  value,
  onValueChange,
  month,
  onMonthChange,
  minDate,
  maxDate,
  isDateDisabled,
  autoFocus = false,
  className,
}: CalendarProps) {
  const {
    locale,
    dir,
    firstDayOfWeek,
    weekend,
    messages: { calendar: messages },
  } = useLocale();
  const today = startOfDay(new Date());
  const [internalMonth, setInternalMonth] = useState(() =>
    startOfMonth(clampDate(value ?? new Date(), minDate, maxDate)),
  );
  const visibleMonth = startOfMonth(month ?? internalMonth);
  const [focusedDate, setFocusedDate] = useState<Date | null>(null);
  const buttons = useRef(new Map<number, HTMLButtonElement>());
  const pendingFocus = useRef<number | null>(null);
  const didMount = useRef(false);
  const headingId = useId();
  const weeks = getMonthWeeks(visibleMonth, firstDayOfWeek);
  const dates = weeks.flat().filter((date): date is Date => date !== null);
  const disabled = (date: Date) =>
    isOutsideRange(date, minDate, maxDate) ||
    Boolean(isDateDisabled?.(new Date(date)));

  // Один день доступен по Tab. Недоступные дни можно прочитать стрелками,
  // но нельзя выбрать — поэтому у них aria-disabled вместо native disabled.
  const tabDate =
    [focusedDate, value, today].find(
      (date) => date && isSameMonth(date, visibleMonth) && !disabled(date),
    ) ??
    dates.find((date) => !disabled(date)) ??
    dates[0];
  const activeDate =
    focusedDate && isSameMonth(focusedDate, visibleMonth)
      ? focusedDate
      : tabDate;

  useLayoutEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      if (autoFocus && activeDate) {
        buttons.current.get(+startOfDay(activeDate))?.focus();
      }
    }
    if (pendingFocus.current !== null) {
      const target = buttons.current.get(pendingFocus.current);
      if (target) {
        target.focus();
        pendingFocus.current = null;
      }
    }
  });

  const monthFormatter = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  });
  const parts = monthFormatter.formatToParts(visibleMonth);
  const monthName = parts.find((part) => part.type === "month")?.value ?? "";
  const year = parts.find((part) => part.type === "year")?.value ?? "";
  const title = `${monthName.charAt(0).toLocaleUpperCase(locale)}${monthName.slice(1)} ${year}`;
  const dayFormatter = new Intl.NumberFormat(locale, { useGrouping: false });
  const dateFormatter = new Intl.DateTimeFormat(locale, { dateStyle: "full" });
  const footerFormatter = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: locale === "en-US" ? "short" : "long",
    year: "numeric",
  });
  const weekdayFormatter = new Intl.DateTimeFormat(locale, {
    weekday: locale === "ar-EG" ? "narrow" : "short",
  });

  function changeMonth(nextMonth: Date) {
    const next = startOfMonth(nextMonth);
    if (isSameMonth(next, visibleMonth)) return;
    if (month === undefined) setInternalMonth(next);
    onMonthChange?.(new Date(next));
  }

  function canNavigate(amount: number) {
    const target = addMonths(visibleMonth, amount);
    const last = addDays(addMonths(target, 1), -1);
    return (
      (!minDate || +last >= +startOfDay(minDate)) &&
      (!maxDate || +target <= +startOfDay(maxDate))
    );
  }

  function selectDate(date: Date) {
    if (!disabled(date)) onValueChange(new Date(date));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, date: Date) {
    let target: Date;
    switch (event.key) {
      case "ArrowLeft":
        target = addDays(date, dir === "rtl" ? 1 : -1);
        break;
      case "ArrowRight":
        target = addDays(date, dir === "rtl" ? -1 : 1);
        break;
      case "ArrowUp":
        target = addDays(date, -7);
        break;
      case "ArrowDown":
        target = addDays(date, 7);
        break;
      case "Home":
        target = addDays(date, -((date.getDay() - firstDayOfWeek + 7) % 7));
        break;
      case "End":
        target = addDays(date, 6 - ((date.getDay() - firstDayOfWeek + 7) % 7));
        break;
      case "PageUp":
        target = addMonths(date, event.shiftKey ? -12 : -1);
        break;
      case "PageDown":
        target = addMonths(date, event.shiftKey ? 12 : 1);
        break;
      default:
        return; // Enter и Space обрабатывает нативная кнопка.
    }
    event.preventDefault();
    target = clampDate(target, minDate, maxDate);
    pendingFocus.current = +target;
    setFocusedDate(target);
    changeMonth(target);
    // При повторном нажатии у границы React может не перерисовать компонент.
    buttons.current.get(+target)?.focus();
  }

  return (
    <div className={cx(s.root, className)} dir={dir} lang={locale}>
      <header className={s.header}>
        <Button
          className={s.navigation}
          variant="outline"
          aria-label={messages.prevMonth}
          disabled={!canNavigate(-1)}
          onClick={() => changeMonth(addMonths(visibleMonth, -1))}
        >
          <Chevron />
        </Button>
        <h2
          className={s.heading}
          id={headingId}
          aria-live="polite"
          aria-atomic="true"
        >
          {title}
        </h2>
        <Button
          className={s.navigation}
          variant="outline"
          aria-label={messages.nextMonth}
          disabled={!canNavigate(1)}
          onClick={() => changeMonth(addMonths(visibleMonth, 1))}
        >
          <Chevron next />
        </Button>
      </header>
      <table className={s.grid} role="grid" aria-labelledby={headingId}>
        <thead>
          <tr>
            {Array.from({ length: 7 }, (_, index) => {
              const day = (firstDayOfWeek + index) % 7;
              const date = new Date(2024, 0, 7 + day);
              return (
                <th
                  key={day}
                  className={s.weekday}
                  scope="col"
                  aria-label={new Intl.DateTimeFormat(locale, {
                    weekday: "long",
                  }).format(date)}
                >
                  {weekdayFormatter.format(date)}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, row) => (
            <tr key={row}>
              {week.map((date, column) => (
                <td
                  className={s.cell}
                  key={column}
                  role="gridcell"
                  aria-selected={date ? isSameDay(date, value) : undefined}
                >
                  {date && (
                    <button
                      type="button"
                      className={s.day}
                      ref={(element) => {
                        if (element) buttons.current.set(+date, element);
                        else buttons.current.delete(+date);
                      }}
                      aria-label={dateFormatter.format(date)}
                      aria-current={isSameDay(date, today) ? "date" : undefined}
                      aria-disabled={disabled(date) || undefined}
                      data-selected={isSameDay(date, value)}
                      data-weekend={weekend.includes(date.getDay())}
                      tabIndex={isSameDay(date, activeDate) ? 0 : -1}
                      onFocus={() => setFocusedDate(date)}
                      onClick={() => selectDate(date)}
                      onKeyDown={(event) => handleKeyDown(event, date)}
                    >
                      {dayFormatter.format(date.getDate())}
                    </button>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <footer className={s.footer}>
        <span className={s.selectedDate} aria-live="polite" aria-atomic="true">
          {value ? footerFormatter.format(value).replace(/\s*г\.$/u, "") : "—"}
        </span>
        <Button
          className={s.today}
          variant="outline"
          icon={<CalendarIcon />}
          disabled={disabled(today)}
          onClick={() => {
            changeMonth(today);
            setFocusedDate(today);
            selectDate(today);
          }}
        >
          {messages.today}
        </Button>
      </footer>
    </div>
  );
}
