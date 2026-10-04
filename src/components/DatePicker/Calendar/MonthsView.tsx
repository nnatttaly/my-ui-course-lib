import cx from "clsx";
import type { CalendarFormatters } from "../hooks/useCalendarFormatters";
import {
  capitalize,
  compareMonths,
  createDate,
  isSameMonth,
} from "../dateUtils";
import type { CalendarSelectHandler } from "./Calendar.types";
import styles from "./Calendar.module.css";

const MONTHS = Array.from({ length: 12 }, (_, index) => index);

interface MonthsViewProps {
  year: number;
  focusedMonth: number;
  value: Date | null;
  minDate?: Date;
  maxDate?: Date;
  formatters: CalendarFormatters;
  onSelect: CalendarSelectHandler<number>;
}

export function MonthsView({
  year,
  focusedMonth,
  value,
  minDate,
  maxDate,
  formatters,
  onSelect,
}: MonthsViewProps): React.ReactNode {
  return (
    <div className={styles.cells}>
      {MONTHS.map((month) => {
        const monthDate = createDate(year, month, 1);
        const isDisabled =
          (!!minDate && compareMonths(monthDate, minDate) < 0) ||
          (!!maxDate && compareMonths(monthDate, maxDate) > 0);
        const isFocused = month === focusedMonth;

        return (
          <button
            key={month}
            type="button"
            className={cx(
              styles.cell,
              value && isSameMonth(value, monthDate) && styles.cellSelected,
            )}
            disabled={isDisabled}
            data-focus-target={isFocused || undefined}
            aria-label={capitalize(formatters.month.format(monthDate))}
            onClick={(event) => onSelect(month, event.currentTarget)}
          >
            {capitalize(
              formatters.monthShort.format(monthDate).replace(".", ""),
            )}
          </button>
        );
      })}
    </div>
  );
}
