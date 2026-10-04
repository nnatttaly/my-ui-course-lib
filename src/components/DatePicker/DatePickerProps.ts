import type { ReactNode } from "react";
import type { Size } from "../shared/sizes";
import type { DEFAULT_TEXTS } from "./DatePicker.constants";

export type DatePickerSize = Size;
export type DatePickerTexts = typeof DEFAULT_TEXTS;
/** 0 — воскресенье, 1 — понедельник, ... */
export type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface DatePickerProps {
  /** Выбранная дата (контролируемый режим). `null` — дата не выбрана. */
  value?: Date | null;
  /** Начальная дата (неконтролируемый режим). */
  defaultValue?: Date | null;
  /**
   * Вызывается с валидной датой (полночь локального времени) или `null`:
   * поле очищено или введена некорректная/недоступная дата.
   */
  onChange?: (date: Date | null) => void;

  /** Минимальная доступная дата (включительно). */
  minDate?: Date;
  /** Максимальная доступная дата (включительно). */
  maxDate?: Date;
  /** Точечно запрещает даты, например выходные. */
  isDateDisabled?: (date: Date) => boolean;

  size?: DatePickerSize;
  label?: ReactNode;
  /** Доступное имя поля, когда нет видимого label. */
  "aria-label"?: string;
  placeholder?: string;
  /** Подсказка под полем. Скрывается, когда показывается ошибка. */
  hint?: ReactNode;
  /** `true` — только красная обводка, текст — обводка и сообщение. */
  error?: ReactNode;
  disabled?: boolean;
  /** Показывать кнопку очистки. */
  clearable?: boolean;

  /** Локаль для названий месяцев и дней недели. Формат ввода всегда ДД.ММ.ГГГГ. */
  locale?: string;
  weekStartsOn?: WeekDay;
  /** Переопределение текстов интерфейса (для i18n). */
  texts?: Partial<DatePickerTexts>;

  /** Имя для формы: в FormData уйдёт дата в формате YYYY-MM-DD. */
  name?: string;
  id?: string;
  className?: string;
  onOpenChange?: (open: boolean) => void;
}
