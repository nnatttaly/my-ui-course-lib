import { useState } from "react";
import { Button } from "./components/Button";
import { Calendar } from "./components/Calendar";
import { arEG, enUS, LocaleContext, ruRU } from "./locale";
import { useTheme } from "./theme";

const locales = { "ru-RU": ruRU, "en-US": enUS, "ar-EG": arEG };
type LocaleName = keyof typeof locales;

export function CalendarDemo() {
  const { theme, setTheme } = useTheme();
  const [locale, setLocale] = useState<LocaleName>("ru-RU");
  const [value, setValue] = useState<Date | null>(null);
  const [month, setMonth] = useState(() => new Date());
  const [limited, setLimited] = useState(false);
  const [disableWeekends, setDisableWeekends] = useState(false);
  const [events, setEvents] = useState<string[]>([]);
  const currentLocale = locales[locale];
  const today = new Date();
  const maxDate = new Date(
    today.getFullYear(),
    today.getMonth() + 2,
    today.getDate(),
  );

  function log(name: string, date: Date) {
    const formatted = new Intl.DateTimeFormat(locale).format(date);
    setEvents((previous) => [`${name}: ${formatted}`, ...previous].slice(0, 4));
  }

  return (
    <section className="calendar-demo" aria-labelledby="calendar-demo-heading">
      <h1 id="calendar-demo-heading">Calendar</h1>
      <div className="calendar-controls">
        <label>
          Язык{" "}
          <select
            value={locale}
            onChange={(event) => setLocale(event.target.value as LocaleName)}
          >
            {Object.keys(locales).map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </label>
        <Button
          variant="outline"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        >
          Тема: {theme}
        </Button>
        <label>
          <input
            type="checkbox"
            checked={limited}
            onChange={(event) => setLimited(event.target.checked)}
          />
          От сегодня до +2 месяцев
        </label>
        <label>
          <input
            type="checkbox"
            checked={disableWeekends}
            onChange={(event) => setDisableWeekends(event.target.checked)}
          />
          Отключить выходные
        </label>
        <Button variant="text" onClick={() => setValue(null)}>
          Сбросить выбор
        </Button>
      </div>
      <div className="calendar-example">
        <LocaleContext value={currentLocale}>
          <Calendar
            value={value}
            onValueChange={(date) => {
              setValue(date);
              log("onValueChange", date);
            }}
            month={month}
            onMonthChange={(date) => {
              setMonth(date);
              log("onMonthChange", date);
            }}
            minDate={limited ? today : undefined}
            maxDate={limited ? maxDate : undefined}
            isDateDisabled={
              disableWeekends
                ? (date) => currentLocale.weekend.includes(date.getDay())
                : undefined
            }
          />
        </LocaleContext>
        <div className="calendar-notes">
          <p>Выбор даты и показанный месяц управляются отдельно.</p>
          <p>
            Клавиатура: Tab — вход в сетку; стрелки — дни; Home / End — начало /
            конец недели; Page Up / Down — месяцы; Shift + Page Up / Down —
            годы; Enter / пробел — выбор.
          </p>
          <p>
            Недоступные даты можно сфокусировать стрелками, выбрать их нельзя.
          </p>
          <p>Последние колбэки:</p>
          <ul className="calendar-events" aria-live="polite">
            {events.map((event, index) => (
              <li key={index}>
                <code>{event}</code>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
