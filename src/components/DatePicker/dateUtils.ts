import { DAYS_IN_GRID, MIN_YEAR } from "./DatePicker.constants";

/**
 * Все даты внутри компонента — полночь локального времени.
 * Через setFullYear, потому что `new Date(50, 0, 1)` превращает 50 в 1950.
 */
export function createDate(year: number, month: number, day: number): Date {
  const date = new Date(0);
  date.setFullYear(year, month, day);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function isValidDate(date: unknown): date is Date {
  return date instanceof Date && !Number.isNaN(date.getTime());
}

export function startOfDay(date: Date): Date {
  return createDate(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Невалидные `Date` (например, `new Date("foo")`) считаем отсутствием значения. */
export function normalizeDate(date: Date | null | undefined): Date | null {
  return isValidDate(date) ? startOfDay(date) : null;
}

export function compareDays(a: Date, b: Date): number {
  return startOfDay(a).getTime() - startOfDay(b).getTime();
}

export function compareMonths(a: Date, b: Date): number {
  return (
    a.getFullYear() * 12 + a.getMonth() - (b.getFullYear() * 12 + b.getMonth())
  );
}

export function isSameDay(
  a: Date | null | undefined,
  b: Date | null | undefined,
): boolean {
  if (!a || !b) return !a && !b;
  return compareDays(a, b) === 0;
}

export function isSameMonth(a: Date, b: Date): boolean {
  return compareMonths(a, b) === 0;
}

export function getDaysInMonth(year: number, month: number): number {
  return createDate(year, month + 1, 0).getDate();
}

export function addDays(date: Date, amount: number): Date {
  return createDate(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() + amount,
  );
}

/** Переносит дату в другой месяц, не перепрыгивая через него: 31.01 → 29.02. */
export function setMonth(date: Date, year: number, month: number): Date {
  const firstDay = createDate(year, month, 1);
  const targetYear = firstDay.getFullYear();
  const targetMonth = firstDay.getMonth();
  const day = Math.min(date.getDate(), getDaysInMonth(targetYear, targetMonth));
  return createDate(targetYear, targetMonth, day);
}

export function addMonths(date: Date, amount: number): Date {
  return setMonth(date, date.getFullYear(), date.getMonth() + amount);
}

export function addYears(date: Date, amount: number): Date {
  return addMonths(date, amount * 12);
}

export function startOfMonth(date: Date): Date {
  return createDate(date.getFullYear(), date.getMonth(), 1);
}

export function startOfWeek(date: Date, weekStartsOn: number): Date {
  return addDays(date, -((date.getDay() - weekStartsOn + 7) % 7));
}

export function endOfWeek(date: Date, weekStartsOn: number): Date {
  return addDays(startOfWeek(date, weekStartsOn), 6);
}

export function isOutOfRange(
  date: Date,
  minDate?: Date,
  maxDate?: Date,
): boolean {
  return (
    (minDate !== undefined && compareDays(date, minDate) < 0) ||
    (maxDate !== undefined && compareDays(date, maxDate) > 0)
  );
}

export function clampDate(date: Date, minDate?: Date, maxDate?: Date): Date {
  if (minDate && compareDays(date, minDate) < 0) return startOfDay(minDate);
  if (maxDate && compareDays(date, maxDate) > 0) return startOfDay(maxDate);
  return date;
}

export function getCalendarDays(month: Date, weekStartsOn: number): Date[] {
  const start = startOfWeek(startOfMonth(month), weekStartsOn);
  return Array.from({ length: DAYS_IN_GRID }, (_, index) =>
    addDays(start, index),
  );
}

function pad(value: number | string, length = 2): string {
  return String(value).padStart(length, "0");
}

export function formatDate(date: Date | null): string {
  if (!date) return "";
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${pad(date.getFullYear(), 4)}`;
}

export function toISODate(date: Date): string {
  return `${pad(date.getFullYear(), 4)}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

const COMPLETE_DATE_REGEXP = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/;

/** Текст введён полностью — можно валидировать. */
export function isCompleteDate(text: string): boolean {
  return COMPLETE_DATE_REGEXP.test(text);
}

/** Строгий парсинг: 31.04 и 29.02 невисокосного года — невалидны. */
export function parseDate(text: string): Date | null {
  const match = COMPLETE_DATE_REGEXP.exec(text);
  if (!match) return null;

  const [day, month, year] = match.slice(1).map(Number);
  if (year < MIN_YEAR) return null;
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > getDaysInMonth(year, month - 1)) return null;

  return createDate(year, month - 1, day);
}

const SEGMENT_LENGTHS = [2, 2, 4];
const SEPARATOR_REGEXP = /[./\-,\s]/;

/**
 * Маска ДД.ММ.ГГГГ: оставляет только цифры, сама расставляет точки.
 * Разделитель, введённый после одной цифры, дополняет её нулём: «1.» → «01.».
 * Разделитель в середине строки (редактирование) ничего не дополняет,
 * чтобы удаление цифры не «откатывалось» маской.
 */
export function applyDateMask(raw: string): string {
  const segments = ["", "", ""];
  let index = 0;

  for (let position = 0; position < raw.length; position++) {
    const char = raw[position];

    if (/\d/.test(char)) {
      if (segments[index].length === SEGMENT_LENGTHS[index]) {
        index++;
        if (index > 2) break;
      }
      segments[index] += char;
    } else if (SEPARATOR_REGEXP.test(char) && index < 2 && segments[index]) {
      if (position === raw.length - 1) {
        segments[index] = pad(segments[index], SEGMENT_LENGTHS[index]);
      }
      index++;
    }
  }

  return segments.slice(0, index + 1).join(".");
}

/** Нормализует вставленный текст: ISO (2024-03-15, с временем) или 15/3/2024. */
export function normalizePastedDate(text: string): string | null {
  const value = text.trim();

  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T\s].*)?$/.exec(value);
  if (iso) return `${pad(iso[3])}.${pad(iso[2])}.${iso[1]}`;

  const local = /^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/.exec(value);
  if (local) return `${pad(local[1])}.${pad(local[2])}.${local[3]}`;

  return null;
}

export function capitalize(text: string): string {
  return text.charAt(0).toLocaleUpperCase() + text.slice(1);
}
