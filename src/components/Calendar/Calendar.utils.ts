// Работаем с локальными календарными днями, без UTC и миллисекундных сдвигов.
export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function startOfMonth(date: Date): Date {
  const result = startOfDay(date);
  result.setDate(1);
  return result;
}

export function addDays(date: Date, amount: number): Date {
  const result = startOfDay(date);
  result.setDate(result.getDate() + amount);
  return result;
}

export function addMonths(date: Date, amount: number): Date {
  const result = startOfMonth(date);
  result.setMonth(result.getMonth() + amount);
  const lastDay = new Date(result);
  lastDay.setMonth(lastDay.getMonth() + 1, 0);
  result.setDate(Math.min(date.getDate(), lastDay.getDate()));
  return result;
}

export function isSameDay(a: Date | null, b: Date | null): boolean {
  return a !== null && b !== null && +startOfDay(a) === +startOfDay(b);
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export function isOutsideRange(
  date: Date,
  minDate?: Date,
  maxDate?: Date,
): boolean {
  const day = +startOfDay(date);
  return (
    (minDate !== undefined && day < +startOfDay(minDate)) ||
    (maxDate !== undefined && day > +startOfDay(maxDate))
  );
}

export function clampDate(date: Date, minDate?: Date, maxDate?: Date): Date {
  if (minDate && +startOfDay(date) < +startOfDay(minDate))
    return startOfDay(minDate);
  if (maxDate && +startOfDay(date) > +startOfDay(maxDate))
    return startOfDay(maxDate);
  return startOfDay(date);
}

export function getMonthWeeks(
  month: Date,
  firstDayOfWeek: number,
): (Date | null)[][] {
  const first = startOfMonth(month);
  const offset = (first.getDay() - firstDayOfWeek + 7) % 7;
  const last = addDays(addMonths(first, 1), -1).getDate();
  return Array.from({ length: Math.ceil((offset + last) / 7) }, (_, row) =>
    Array.from({ length: 7 }, (_, column) => {
      const day = row * 7 + column - offset + 1;
      return day < 1 || day > last ? null : addDays(first, day - 1);
    }),
  );
}
