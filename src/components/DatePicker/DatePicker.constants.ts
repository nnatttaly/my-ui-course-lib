export { SIZES as DATE_PICKER_SIZES } from "../shared/sizes";

export const DEFAULT_LOCALE = "ru-RU";
export const DATE_PLACEHOLDER = "ДД.ММ.ГГГГ";
export const DATE_LENGTH = DATE_PLACEHOLDER.length;

/** 6 недель — сетка не «прыгает» по высоте при переключении месяцев. */
export const DAYS_IN_GRID = 42;
export const YEARS_PER_PAGE = 12;
/** Годы меньше считаем опечаткой (например, «01.01.0024»). */
export const MIN_YEAR = 1000;

/** Отступ попапа от поля и от краёв окна. */
export const POPUP_GAP = 6;
export const VIEWPORT_PADDING = 8;

export const DEFAULT_TEXTS = {
  /** Доступное имя поля, если нет label и aria-label. */
  inputLabel: "Дата",
  openCalendar: "Открыть календарь",
  clear: "Очистить",
  dialog: "Выбор даты",
  prevMonth: "Предыдущий месяц",
  nextMonth: "Следующий месяц",
  prevYear: "Предыдущий год",
  nextYear: "Следующий год",
  prevYears: "Предыдущие годы",
  nextYears: "Следующие годы",
  chooseMonth: "Выбрать месяц",
  chooseYear: "Выбрать год",
  invalidDate: "Некорректная дата",
  outOfRange: "Дата вне допустимого диапазона",
  unavailableDate: "Эта дата недоступна",
};
