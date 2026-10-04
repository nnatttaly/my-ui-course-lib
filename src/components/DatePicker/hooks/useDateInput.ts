import { useState } from "react";
import type { ChangeEvent, ClipboardEvent } from "react";
import {
  applyDateMask,
  formatDate,
  isCompleteDate,
  isSameDay,
  normalizePastedDate,
  parseDate,
} from "../dateUtils";

export type DateError = "invalidDate" | "outOfRange" | "unavailableDate";

interface UseDateInputOptions {
  value: Date | null;
  /** Проверка ограничений (min/max, isDateDisabled) для распознанной даты. */
  validate: (date: Date) => DateError | null;
  onCommit: (date: Date | null) => void;
}

/**
 * Текстовый ввод даты по маске.
 *
 * Пока пользователь печатает, в поле показывается черновик (draft), иначе —
 * отформатированное значение. Поэтому если контролирующий родитель отклонил
 * дату, поле покажет реальное значение, а не то, что выбрали.
 *
 * - пустой текст → onCommit(null);
 * - полная валидная дата → onCommit(date);
 * - полная, но ошибочная дата → onCommit(null), текст и ошибка остаются в поле;
 * - недописанная дата при потере фокуса откатывается к значению.
 */
export function useDateInput({
  value,
  validate,
  onCommit,
}: UseDateInputOptions) {
  const [draft, setDraft] = useState<string | null>(null);

  const getDraftError = (text: string): DateError | null => {
    if (!isCompleteDate(text)) return null;
    const parsed = parseDate(text);
    return parsed ? validate(parsed) : "invalidDate";
  };

  // Значение поменялось — показываем его вместо черновика. Исключение: мы сами
  // обнулили значение из-за ошибочной даты, тогда черновик с ошибкой остаётся.
  // Сравниваем по дню: родитель может создавать new Date() на каждый рендер.
  const [syncedValue, setSyncedValue] = useState(value);
  if (!isSameDay(syncedValue, value)) {
    setSyncedValue(value);
    const isOwnInvalidCommit =
      value === null && draft !== null && getDraftError(draft) !== null;
    if (!isOwnInvalidCommit) setDraft(null);
  }

  const commitText = (rawText: string) => {
    const masked = applyDateMask(rawText);
    setDraft(masked);

    if (masked === "") {
      onCommit(null);
      return;
    }
    // Пока дата не введена целиком — ничего не меняем и не ругаемся.
    if (!isCompleteDate(masked)) return;

    const parsed = parseDate(masked);
    onCommit(parsed && !validate(parsed) ? parsed : null);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    commitText(event.target.value);
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const normalized = normalizePastedDate(event.clipboardData.getData("text"));
    if (!normalized) return;
    event.preventDefault();
    commitText(normalized);
  };

  const handleBlur = () => {
    // Ошибочную полную дату оставляем — пользователь видит, что не так.
    if (draft !== null && getDraftError(draft) === null) setDraft(null);
  };

  return {
    text: draft ?? formatDate(value),
    error: draft === null ? null : getDraftError(draft),
    handleChange,
    handlePaste,
    handleBlur,
    /** Сбросить черновик и показать текущее значение. */
    reset: () => setDraft(null),
  };
}
