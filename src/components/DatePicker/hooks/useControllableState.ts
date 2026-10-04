import { useState } from "react";

interface UseControllableStateOptions<T> {
  /** `undefined` — неконтролируемый режим. */
  value: T | undefined;
  defaultValue: T;
  onChange?: (value: T) => void;
  isEqual?: (a: T, b: T) => boolean;
}

/** Значение, которое может храниться снаружи (value) или внутри (defaultValue). */
export function useControllableState<T>({
  value,
  defaultValue,
  onChange,
  isEqual = Object.is,
}: UseControllableStateOptions<T>): [T, (next: T) => void] {
  const isControlled = value !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const currentValue = isControlled ? value : uncontrolledValue;

  const setValue = (next: T) => {
    if (isEqual(next, currentValue)) return;
    if (!isControlled) setUncontrolledValue(next);
    onChange?.(next);
  };

  return [currentValue, setValue];
}
