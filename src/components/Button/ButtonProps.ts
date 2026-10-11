import type { ComponentPropsWithRef } from "react";
import type { VARIANTS, SIZES } from "./Button.constants";

export type Variant = (typeof VARIANTS)[number];
export type Size = (typeof SIZES)[number];
export type ButtonElement = "button" | "a";

interface ButtonOwnProps<E extends ButtonElement> {
  as?: E;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
}

export type ButtonProps<E extends ButtonElement = "button"> =
  ButtonOwnProps<E> &
    Omit<ComponentPropsWithRef<E>, keyof ButtonOwnProps<E>>;
