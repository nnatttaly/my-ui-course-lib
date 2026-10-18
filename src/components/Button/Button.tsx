import type { ElementType } from "react";
import type { ButtonElement, ButtonProps } from "./ButtonProps";
import cx from "clsx";
import { button } from "./Button.css";

export function Button<E extends ButtonElement = "button">({
  as,
  variant = "fill",
  size = "s",
  disabled,
  className,
  ...restProps
}: ButtonProps<E>): React.ReactNode {
  const Component = (as ?? "button") as ElementType;
  const elementProps =
    as === "a"
      ? {
          ...restProps,
          ...(disabled && {
            href: undefined,
            onClick: undefined,
            role: "link",
            "aria-disabled": true,
          }),
        }
      : { type: "button", ...restProps, disabled };

  return (
    <Component
      {...elementProps}
      className={cx(button({ variant, size }), className)}
    />
  );
}
