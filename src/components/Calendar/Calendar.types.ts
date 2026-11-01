export interface CalendarProps {
  /** Выбранная дата. Выбором управляет родитель. */
  value: Date | null;
  onValueChange: (date: Date) => void;
  /** Показанный месяц. Без этого пропса календарь управляет им сам. */
  month?: Date;
  onMonthChange?: (month: Date) => void;
  /** Границы включительны; время суток не учитывается. */
  minDate?: Date;
  maxDate?: Date;
  isDateDisabled?: (date: Date) => boolean;
  autoFocus?: boolean;
  className?: string;
}
