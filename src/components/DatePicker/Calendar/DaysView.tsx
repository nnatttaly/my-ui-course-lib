import { useMemo } from "react";
import type { KeyboardEvent } from "react";
import cx from "clsx";
import type { WeekDay } from "../DatePickerProps";
import type { CalendarFormatters } from "../hooks/useCalendarFormatters";
import {
  addDays,
  addMonths,
  addYears,
  createDate,
  endOfWeek,
  getCalendarDays,
  isSameDay,
  isSameMonth,
  startOfWeek,
} from "../dateUtils";
import styles from "./Calendar.module.css";

interface DaysViewProps {
  /** Дата под клавиатурным курсором; её месяц и показывается. */
  focusedDate: Date;
  value: Date | null;
  today: Date;
  weekStartsOn: WeekDay;
  formatters: CalendarFormatters;
  label: string;
  isSelectable: (date: Date) => boolean;
  onSelect: (date: Date) => void;
  onMoveFocus: (date: Date, container: Element) => void;
}

export function DaysView({
  focusedDate,
  value,
  today,
  weekStartsOn,
  formatters,
  label,
  isSelectable,
  onSelect,
  onMoveFocus,
}: DaysViewProps): React.ReactNode {
  const weekdays = useMemo(
    // 07.01.2024 — воскресенье, от него отсчитываем дни недели.
    () =>
      Array.from({ length: 7 }, (_, index) => {
        const date = createDate(2024, 0, 7 + ((weekStartsOn + index) % 7));
        return {
          short: formatters.weekdayShort.format(date),
          long: formatters.weekdayLong.format(date),
        };
      }),
    [formatters, weekStartsOn],
  );

  const days = getCalendarDays(focusedDate, weekStartsOn);
  const weeks = Array.from({ length: days.length / 7 }, (_, index) =>
    days.slice(index * 7, index * 7 + 7),
  );

  const handleKeyDown = (event: KeyboardEvent<HTMLTableElement>) => {
    const keyMap: Record<string, () => Date> = {
      ArrowLeft: () => addDays(focusedDate, -1),
      ArrowRight: () => addDays(focusedDate, 1),
      ArrowUp: () => addDays(focusedDate, -7),
      ArrowDown: () => addDays(focusedDate, 7),
      Home: () => startOfWeek(focusedDate, weekStartsOn),
      End: () => endOfWeek(focusedDate, weekStartsOn),
      PageUp: () =>
        event.shiftKey ? addYears(focusedDate, -1) : addMonths(focusedDate, -1),
      PageDown: () =>
        event.shiftKey ? addYears(focusedDate, 1) : addMonths(focusedDate, 1),
    };
    const getNextDate = keyMap[event.key];
    if (!getNextDate) return;

    event.preventDefault();
    onMoveFocus(getNextDate(), event.currentTarget);
  };

  return (
    <table
      role="grid"
      className={styles.grid}
      aria-label={label}
      onKeyDown={handleKeyDown}
    >
      <thead>
        <tr>
          {weekdays.map((weekday) => (
            <th
              key={weekday.long}
              scope="col"
              abbr={weekday.long}
              className={styles.weekday}
            >
              {weekday.short}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {weeks.map((week) => (
          <tr key={week[0].getTime()}>
            {week.map((day) => {
              const isSelected = isSameDay(day, value);
              const isFocused = isSameDay(day, focusedDate);
              const isToday = isSameDay(day, today);
              const isDisabled = !isSelectable(day);

              return (
                <td
                  key={day.getTime()}
                  role="gridcell"
                  aria-selected={isSelected}
                >
                  {/* aria-disabled вместо disabled: на недоступную дату можно
                      перейти стрелками, но нельзя её выбрать. */}
                  <button
                    type="button"
                    className={cx(
                      styles.day,
                      !isSameMonth(day, focusedDate) && styles.dayOutside,
                      isToday && styles.dayToday,
                      isSelected && styles.daySelected,
                    )}
                    tabIndex={isFocused ? 0 : -1}
                    data-focus-target={isFocused || undefined}
                    aria-label={formatters.fullDate.format(day)}
                    aria-current={isToday ? "date" : undefined}
                    aria-disabled={isDisabled || undefined}
                    onClick={() => {
                      if (!isDisabled) onSelect(day);
                    }}
                  >
                    {day.getDate()}
                  </button>
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
