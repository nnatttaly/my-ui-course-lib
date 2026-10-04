import { useMemo } from "react";

export interface CalendarFormatters {
  month: Intl.DateTimeFormat;
  monthShort: Intl.DateTimeFormat;
  weekdayShort: Intl.DateTimeFormat;
  weekdayLong: Intl.DateTimeFormat;
  fullDate: Intl.DateTimeFormat;
}

/** Intl-форматтеры дороги в создании — создаём один раз на локаль. */
export function useCalendarFormatters(locale: string): CalendarFormatters {
  return useMemo(
    () => ({
      month: new Intl.DateTimeFormat(locale, { month: "long" }),
      monthShort: new Intl.DateTimeFormat(locale, { month: "short" }),
      weekdayShort: new Intl.DateTimeFormat(locale, { weekday: "short" }),
      weekdayLong: new Intl.DateTimeFormat(locale, { weekday: "long" }),
      fullDate: new Intl.DateTimeFormat(locale, {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    }),
    [locale],
  );
}
