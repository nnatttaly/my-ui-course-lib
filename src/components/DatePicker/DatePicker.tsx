import { useId, useRef, useState } from "react";
import type { FocusEvent, KeyboardEvent, MouseEvent } from "react";
import { createPortal } from "react-dom";
import cx from "clsx";
import "../../styles/tokens.css";
import { Calendar } from "./Calendar/Calendar";
import {
  DATE_LENGTH,
  DATE_PLACEHOLDER,
  DEFAULT_LOCALE,
  DEFAULT_TEXTS,
} from "./DatePicker.constants";
import type { DatePickerProps } from "./DatePickerProps";
import { isOutOfRange, isSameDay, normalizeDate, toISODate } from "./dateUtils";
import { useControllableState } from "./hooks/useControllableState";
import { useDateInput } from "./hooks/useDateInput";
import type { DateError } from "./hooks/useDateInput";
import { usePopover } from "./hooks/usePopover";
import { CalendarIcon, ClearIcon } from "./icons";
import styles from "./DatePicker.module.css";

const preventFocusLoss = (event: MouseEvent) => event.preventDefault();

export function DatePicker({
  value: valueProp,
  defaultValue = null,
  onChange,
  minDate,
  maxDate,
  isDateDisabled,
  size = "s",
  label,
  "aria-label": ariaLabel,
  placeholder = DATE_PLACEHOLDER,
  hint,
  error,
  disabled = false,
  clearable = true,
  locale = DEFAULT_LOCALE,
  weekStartsOn = 1,
  texts,
  name,
  id,
  className,
  onOpenChange,
}: DatePickerProps): React.ReactNode {
  const t = { ...DEFAULT_TEXTS, ...texts };

  const generatedId = useId();
  const inputId = id ?? `${generatedId}-input`;
  const popupId = `${generatedId}-popup`;
  const messageId = `${generatedId}-message`;

  const rootRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const [value, setValue] = useControllableState<Date | null>({
    value: valueProp === undefined ? undefined : normalizeDate(valueProp),
    defaultValue: normalizeDate(defaultValue),
    onChange,
    isEqual: isSameDay,
  });

  const getDateError = (date: Date): DateError | null => {
    if (isOutOfRange(date, minDate, maxDate)) return "outOfRange";
    if (isDateDisabled?.(date)) return "unavailableDate";
    return null;
  };

  const input = useDateInput({
    value,
    validate: getDateError,
    onCommit: setValue,
  });

  const popover = usePopover({
    containerRef: rootRef,
    anchorRef: fieldRef,
    popupRef,
    disabled,
    onOpenChange,
  });
  const [autoFocusCalendar, setAutoFocusCalendar] = useState(false);

  const openCalendar = (moveFocus: boolean) => {
    if (disabled) return;
    if (popover.isOpen) {
      if (moveFocus) {
        popupRef.current
          ?.querySelector<HTMLElement>('[data-focus-target="true"]')
          ?.focus();
      }
      return;
    }
    setAutoFocusCalendar(moveFocus);
    popover.open();
  };

  const closeCalendar = () => {
    // Возвращаем фокус в поле, только если он был внутри календаря —
    // иначе на мобильных лишний раз откроется клавиатура.
    if (popupRef.current?.contains(document.activeElement)) {
      inputRef.current?.focus();
    }
    popover.close();
  };

  // Ушли из компонента по Tab — закрываем. relatedTarget === null (переключили
  // вкладку) игнорируем, клик мимо обрабатывает usePopover.
  // React всплывает события и из портала, поэтому сюда приходит blur и из попапа.
  const handleRootBlur = (event: FocusEvent<HTMLDivElement>) => {
    const nextFocused = event.relatedTarget as Node | null;
    if (popover.isOpen && nextFocused && !popover.contains(nextFocused)) {
      popover.close();
    }
  };

  // Черновик сбрасываем до коммита: если родитель отклонит дату,
  // поле покажет реальное значение.
  const handleSelect = (date: Date) => {
    input.reset();
    setValue(date);
    closeCalendar();
  };

  const handleClear = () => {
    input.reset();
    setValue(null);
    inputRef.current?.focus();
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      openCalendar(true);
    } else if (event.key === "Escape" && popover.isOpen) {
      event.preventDefault();
      closeCalendar();
    }
  };

  const handleToggleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (popover.isOpen) {
      closeCalendar();
      return;
    }
    // detail === 0 — кнопку нажали с клавиатуры: переводим фокус в календарь.
    const isKeyboard = event.detail === 0;
    if (!isKeyboard) inputRef.current?.focus();
    openCalendar(isKeyboard);
  };

  // Ошибка ввода важнее ошибки значения. Ошибка значения появляется, когда
  // min/max/isDateDisabled поменялись или родитель передал недоступную дату.
  const dateError = input.error ?? (value ? getDateError(value) : null);
  // Приоритет сообщения: внешняя ошибка > ошибка даты > подсказка.
  const externalErrorMessage = typeof error === "boolean" ? null : error;
  const isInvalid = Boolean(error) || dateError !== null;
  const message =
    externalErrorMessage || (dateError ? t[dateError] : null) || hint;
  const showClear = clearable && !disabled && input.text !== "";

  return (
    <div
      ref={rootRef}
      className={cx(styles.root, styles[size], className)}
      onBlur={handleRootBlur}
    >
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}

      <div
        ref={fieldRef}
        className={cx(
          styles.field,
          isInvalid && styles.invalid,
          popover.isOpen && styles.open,
          disabled && styles.disabled,
        )}
      >
        <input
          ref={inputRef}
          id={inputId}
          className={styles.input}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          maxLength={DATE_LENGTH}
          placeholder={placeholder}
          value={input.text}
          disabled={disabled}
          aria-label={label ? undefined : (ariaLabel ?? t.inputLabel)}
          aria-invalid={isInvalid || undefined}
          aria-describedby={message ? messageId : undefined}
          aria-haspopup="dialog"
          aria-expanded={popover.isOpen}
          aria-controls={popover.isOpen ? popupId : undefined}
          onChange={input.handleChange}
          onPaste={input.handlePaste}
          onBlur={input.handleBlur}
          onKeyDown={handleInputKeyDown}
          onClick={() => openCalendar(false)}
        />

        {showClear && (
          <button
            type="button"
            className={styles.iconButton}
            aria-label={t.clear}
            onMouseDown={preventFocusLoss}
            onClick={handleClear}
          >
            <ClearIcon />
          </button>
        )}

        <button
          type="button"
          className={styles.iconButton}
          aria-label={t.openCalendar}
          aria-haspopup="dialog"
          aria-expanded={popover.isOpen}
          disabled={disabled}
          onMouseDown={preventFocusLoss}
          onClick={handleToggleClick}
        >
          <CalendarIcon />
        </button>
      </div>

      {message && (
        <div
          id={messageId}
          className={cx(styles.message, isInvalid && styles.messageError)}
          aria-live="polite"
        >
          {message}
        </div>
      )}

      {name && (
        <input
          type="hidden"
          name={name}
          value={value ? toISODate(value) : ""}
          disabled={disabled}
        />
      )}

      {popover.isOpen &&
        createPortal(
          // preventDefault на mousedown: клик внутри календаря не уводит фокус из поля
          // (иначе в Safari попап закрывался бы раньше, чем сработает клик по дате).
          <div
            ref={popupRef}
            id={popupId}
            role="dialog"
            aria-label={t.dialog}
            className={styles.popup}
            onMouseDown={preventFocusLoss}
            onKeyDown={popover.handlePopupKeyDown}
          >
            <Calendar
              value={value}
              minDate={minDate}
              maxDate={maxDate}
              isDateDisabled={isDateDisabled}
              locale={locale}
              weekStartsOn={weekStartsOn}
              texts={t}
              autoFocus={autoFocusCalendar}
              onSelect={handleSelect}
              onClose={closeCalendar}
            />
          </div>,
          document.body,
        )}
    </div>
  );
}
