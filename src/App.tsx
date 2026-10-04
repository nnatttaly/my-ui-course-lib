import { useState } from "react";
import type { ReactNode, SubmitEvent } from "react";
import "./App.css";
import { Button, VARIANTS } from "./components/Button";
import { DATE_PICKER_SIZES, DatePicker } from "./components/DatePicker";
import { SIZES } from "./components/shared/sizes";

const today = new Date();
const addDays = (date: Date, amount: number) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
const isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6;
const formatValue = (date: Date | null) =>
  date ? date.toLocaleDateString("ru-RU") : "null";

/* --- Каркас витрины --- */

interface SectionProps {
  title?: string;
  description?: ReactNode;
  /** Выровнять примеры по центру по вертикали (для элементов разной высоты). */
  centered?: boolean;
  children: ReactNode;
}

function Section({ title, description, centered, children }: SectionProps) {
  return (
    <section className="section">
      {title && (
        <header className="section-header">
          <h3 className="section-title">{title}</h3>
          {description && <p className="section-description">{description}</p>}
        </header>
      )}
      <div
        className={
          centered ? "section-body section-body-centered" : "section-body"
        }
      >
        {children}
      </div>
    </section>
  );
}

interface ExampleProps {
  title: string;
  note?: ReactNode;
  children: ReactNode;
}

function Example({ title, note, children }: ExampleProps) {
  return (
    <div className="example">
      <div className="example-title">{title}</div>
      {note && <div className="example-note">{note}</div>}
      <div className="example-content">{children}</div>
    </div>
  );
}

function Output({ children }: { children: ReactNode }) {
  return <code className="example-output">{children}</code>;
}

/* --- Button --- */

function ButtonStates() {
  return (
    <table className="button-states">
      <thead>
        <tr>
          <th>variant</th>
          <th>size</th>
          <th>default</th>
          <th>:hover</th>
          <th>:active</th>
          <th>disabled</th>
        </tr>
      </thead>
      <tbody>
        {VARIANTS.map((variant) =>
          SIZES.map((size) => (
            <tr key={`${variant}-${size}`}>
              <td>{variant}</td>
              <td>{size}</td>
              <td>
                <Button variant={variant} size={size}>
                  Кнопка
                </Button>
              </td>
              <td>
                <Button variant={variant} size={size} data-state="hover">
                  Кнопка
                </Button>
              </td>
              <td>
                <Button variant={variant} size={size} data-state="active">
                  Кнопка
                </Button>
              </td>
              <td>
                <Button variant={variant} size={size} disabled>
                  Кнопка
                </Button>
              </td>
            </tr>
          )),
        )}
      </tbody>
    </table>
  );
}

/* --- DatePicker: примеры с состоянием --- */

function ControlledExample() {
  const [date, setDate] = useState<Date | null>(today);

  return (
    <Example
      title="Контролируемый"
      note="value + onChange, значение меняется и снаружи"
    >
      <DatePicker value={date} onChange={setDate} />
      <div className="example-actions">
        <Button variant="outline" size="s" onClick={() => setDate(new Date())}>
          Сегодня
        </Button>
        <Button
          variant="outline"
          size="s"
          onClick={() => setDate((prev) => addDays(prev ?? today, 1))}
        >
          +1 день
        </Button>
        <Button variant="text" size="s" onClick={() => setDate(null)}>
          Сбросить
        </Button>
      </div>
      <Output>value: {formatValue(date)}</Output>
    </Example>
  );
}

function UncontrolledExample() {
  const [lastChange, setLastChange] = useState<Date | null>(today);

  return (
    <Example
      title="Неконтролируемый"
      note="defaultValue, компонент хранит значение сам"
    >
      <DatePicker defaultValue={today} onChange={setLastChange} />
      <Output>onChange: {formatValue(lastChange)}</Output>
    </Example>
  );
}

function FormExample() {
  const [submitted, setSubmitted] = useState<string | null>(null);

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    setSubmitted(JSON.stringify(data));
  };

  return (
    <Example
      title="В нативной форме"
      note={
        <>
          name → <code>YYYY-MM-DD</code> в FormData
        </>
      }
    >
      <form className="example-form" onSubmit={handleSubmit}>
        <DatePicker name="date" />
        <Button type="submit" size="s">
          Отправить
        </Button>
      </form>
      {submitted && <Output>FormData: {submitted}</Output>}
    </Example>
  );
}

/* --- Страница --- */

function App() {
  return (
    <div className="page">
      <h2 className="component-title">Button</h2>
      <Section>
        <ButtonStates />
      </Section>

      <h2 className="component-title">DatePicker</h2>

      <Section title="Размеры" centered>
        {DATE_PICKER_SIZES.map((size) => (
          <Example key={size} title={`size="${size}"`}>
            <DatePicker size={size} defaultValue={today} />
          </Example>
        ))}
      </Section>

      <Section title="Состояния">
        <Example title="Пустое">
          <DatePicker />
        </Example>
        <Example title="С надписью">
          <DatePicker label="Дата рождения" />
        </Example>
        <Example title="Заполненное">
          <DatePicker defaultValue={today} />
        </Example>
        <Example title="С подсказкой">
          <DatePicker hint="Например, 15.03.2024" />
        </Example>
        <Example title="Ошибка с текстом">
          <DatePicker defaultValue={today} error="Дата занята" />
        </Example>
        <Example title="Ошибка без текста">
          <DatePicker error />
        </Example>
        <Example title="Disabled">
          <DatePicker defaultValue={today} disabled />
        </Example>
        <Example title="Без очистки">
          <DatePicker defaultValue={today} clearable={false} />
        </Example>
      </Section>

      <Section
        title="Ограничения дат"
        description="Недоступные даты зачёркнуты в календаре. Если ввести их с клавиатуры, появится ошибка."
      >
        <Example title="Диапазон" note="minDate / maxDate: ближайшие 30 дней">
          <DatePicker minDate={today} maxDate={addDays(today, 30)} />
        </Example>
        <Example title="Без выходных" note="isDateDisabled">
          <DatePicker isDateDisabled={isWeekend} />
        </Example>
        <Example title="Только прошлое" note="maxDate = сегодня">
          <DatePicker maxDate={today} />
        </Example>
      </Section>

      <Section title="Управление значением">
        <ControlledExample />
        <UncontrolledExample />
        <FormExample />
      </Section>

      <Section
        title="Локализация"
        description="locale меняет названия месяцев и дней недели, texts — подписи интерфейса."
      >
        <Example title="en-US" note="weekStartsOn={0}: неделя с воскресенья">
          <DatePicker
            locale="en-US"
            weekStartsOn={0}
            placeholder="DD.MM.YYYY"
            texts={{
              clear: "Clear",
              openCalendar: "Open calendar",
              dialog: "Choose date",
              prevMonth: "Previous month",
              nextMonth: "Next month",
              chooseMonth: "Choose month",
              chooseYear: "Choose year",
              invalidDate: "Invalid date",
            }}
          />
        </Example>
      </Section>

      <Section
        title="Позиционирование"
        description="Если снизу не хватает места, календарь открывается вверх."
      >
        <Example title="Открытие вверх">
          <DatePicker />
        </Example>
      </Section>
    </div>
  );
}

export default App;
