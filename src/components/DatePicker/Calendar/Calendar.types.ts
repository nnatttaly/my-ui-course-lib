export type CalendarView = "days" | "months" | "years";

/**
 * Обработчик выбора в виде календаря. `container` — элемент, по которому
 * кликнули: если фокус был в нём (работа с клавиатуры), календарь переведёт
 * фокус на новую цель после смены вида.
 */
export type CalendarSelectHandler<T> = (value: T, container: Element) => void;
