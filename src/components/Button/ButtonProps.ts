import type { ComponentProps } from "react";
import type { VARIANTS, SIZES } from "./Button.constants";

export type Variant = (typeof VARIANTS)[number];
export type Size = (typeof SIZES)[number];

export interface ButtonProps extends ComponentProps<"button"> {
  variant?: Variant;
  size?: Size;
}
