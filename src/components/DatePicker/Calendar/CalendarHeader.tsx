import cx from "clsx";
import { ChevronIcon } from "../icons";
import type { DatePickerTexts } from "../DatePickerProps";
import type { CalendarView } from "./Calendar.types";
import styles from "./Calendar.module.css";

interface CalendarHeaderProps {
  view: CalendarView;
  monthName: string;
  year: number;
  /** Что озвучить скринридеру при навигации. */
  announcement: string;
  texts: DatePickerTexts;
  prevLabel: string;
  nextLabel: string;
  isPrevDisabled: boolean;
  isNextDisabled: boolean;
  onToggleView: (view: Exclude<CalendarView, "days">) => void;
  onShift: (direction: -1 | 1) => void;
}

/** Слева — выбор месяца и года, справа рядом — стрелки. */
export function CalendarHeader({
  view,
  monthName,
  year,
  announcement,
  texts,
  prevLabel,
  nextLabel,
  isPrevDisabled,
  isNextDisabled,
  onToggleView,
  onShift,
}: CalendarHeaderProps): React.ReactNode {
  const selects = [
    { view: "months", text: monthName, label: texts.chooseMonth },
    { view: "years", text: String(year), label: texts.chooseYear },
  ] as const;

  return (
    <div className={styles.header}>
      <div className={styles.headerGroup}>
        {selects.map((select) => {
          const isActive = view === select.view;
          return (
            <button
              key={select.view}
              type="button"
              className={cx(
                styles.selectButton,
                isActive && styles.selectButtonActive,
              )}
              aria-label={`${select.text}. ${select.label}`}
              aria-expanded={isActive}
              onClick={() => onToggleView(select.view)}
            >
              {select.text}
              <ChevronIcon direction={isActive ? "up" : "down"} />
            </button>
          );
        })}
      </div>

      <div className={styles.headerGroup}>
        <button
          type="button"
          className={styles.navButton}
          aria-label={prevLabel}
          disabled={isPrevDisabled}
          onClick={() => onShift(-1)}
        >
          <ChevronIcon direction="left" />
        </button>
        <button
          type="button"
          className={styles.navButton}
          aria-label={nextLabel}
          disabled={isNextDisabled}
          onClick={() => onShift(1)}
        >
          <ChevronIcon direction="right" />
        </button>
      </div>

      <span className={styles.srOnly} aria-live="polite">
        {announcement}
      </span>
    </div>
  );
}
