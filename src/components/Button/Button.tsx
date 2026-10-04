import type { ButtonProps } from "./ButtonProps";
import cx from "clsx";
import "../../styles/tokens.css";
import styles from "./Button.module.css";

export function Button({
  variant = "fill",
  size = "s",
  type = "button",
  className,
  ...restProps
}: ButtonProps): React.ReactNode {
  return (
    <button
      type={type}
      className={cx(styles.button, styles[variant], styles[size], className)}
      {...restProps}
    />
  );
}
