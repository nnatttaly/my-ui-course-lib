import cx from "clsx";
import { YEARS_PER_PAGE } from "../DatePicker.constants";
import type { CalendarSelectHandler } from "./Calendar.types";
import styles from "./Calendar.module.css";

interface YearsViewProps {
  pageStart: number;
  focusedYear: number;
  selectedYear?: number;
  currentYear: number;
  isYearDisabled: (year: number) => boolean;
  onSelect: CalendarSelectHandler<number>;
}

export function YearsView({
  pageStart,
  focusedYear,
  selectedYear,
  currentYear,
  isYearDisabled,
  onSelect,
}: YearsViewProps): React.ReactNode {
  return (
    <div className={styles.cells}>
      {Array.from({ length: YEARS_PER_PAGE }, (_, index) => {
        const year = pageStart + index;

        return (
          <button
            key={year}
            type="button"
            className={cx(
              styles.cell,
              year === selectedYear && styles.cellSelected,
              year === currentYear && styles.cellCurrent,
            )}
            disabled={isYearDisabled(year)}
            data-focus-target={year === focusedYear || undefined}
            onClick={(event) => onSelect(year, event.currentTarget)}
          >
            {year}
          </button>
        );
      })}
    </div>
  );
}
