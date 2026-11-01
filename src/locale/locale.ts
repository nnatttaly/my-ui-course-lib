import { createContext, useContext } from "react";

export interface Locale {
  locale: string;
  dir: "ltr" | "rtl";
  firstDayOfWeek: number;
  weekend: readonly number[];
  messages: {
    calendar: {
      today: string;
      prevMonth: string;
      nextMonth: string;
    };
  };
}

export const ruRU: Locale = {
  locale: "ru-RU",
  dir: "ltr",
  firstDayOfWeek: 1,
  weekend: [6, 0],
  messages: {
    calendar: {
      today: "Сегодня",
      prevMonth: "Предыдущий месяц",
      nextMonth: "Следующий месяц",
    },
  },
};

export const enUS: Locale = {
  locale: "en-US",
  dir: "ltr",
  firstDayOfWeek: 0,
  weekend: [6, 0],
  messages: {
    calendar: {
      today: "Today",
      prevMonth: "Previous month",
      nextMonth: "Next month",
    },
  },
};

export const arEG: Locale = {
  locale: "ar-EG",
  dir: "rtl",
  firstDayOfWeek: 6,
  weekend: [5, 6],
  messages: {
    calendar: {
      today: "اليوم",
      prevMonth: "الشهر السابق",
      nextMonth: "الشهر التالي",
    },
  },
};

export const LocaleContext = createContext<Locale>(ruRU);
export const useLocale = () => useContext(LocaleContext);
