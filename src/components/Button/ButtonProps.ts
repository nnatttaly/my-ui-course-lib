import type { ComponentProps } from "react";
import type { VARIANTS } from "./Button.constants";
import type { Size } from "../shared/sizes";

export type Variant = (typeof VARIANTS)[number];

export interface ButtonProps extends ComponentProps<"button"> {
  variant?: Variant;
  size?: Size;
}
