import { createVar, type StyleRule } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { vars } from "../../theme/theme.css";

/*
 * Локальные переменные кнопки. Базовый стиль рисует кнопку только через них,
 * а вариант × состояние лишь подставляет нужные токены темы.
 * Так комбинаторика живёт в одном месте — в функции variant().
 */
const bg = createVar();
const text = createVar();
const border = createVar();

const DISABLED = ':is(:disabled, [aria-disabled="true"])';
const ENABLED = ':not(:disabled, [aria-disabled="true"])';

type VariantTokens = typeof vars.button.fill;
type StateTokens = VariantTokens["default"];

const paint = (state: StateTokens) => ({
  [bg]: state.bg,
  [text]: state.text,
  [border]: state.border,
});

const variant = (tokens: VariantTokens): StyleRule => ({
  vars: paint(tokens.default),
  selectors: {
    // data-state — чтобы показать состояние в демо без наведения мышью
    [`&:hover${ENABLED}, &[data-state="hover"]`]: {
      vars: paint(tokens.hover),
    },
    [`&:active${ENABLED}, &[data-state="active"]`]: {
      vars: paint(tokens.active),
    },
    [`&${DISABLED}`]: { vars: paint(tokens.disabled) },
  },
});

const size = (tokens: typeof vars.button.size.s): StyleRule => ({
  height: tokens.height,
  paddingInline: tokens.paddingX,
  fontSize: tokens.fontSize,
});

export const button = recipe({
  base: {
    boxSizing: "border-box",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 140,
    border: `1px solid ${border}`,
    borderRadius: vars.button.radius,
    fontFamily: vars.font.family,
    fontWeight: 600,
    textDecoration: "none",
    color: text,
    background: bg,
    cursor: "pointer",
    transition: "background-color 120ms, color 120ms, border-color 120ms",
    selectors: {
      [`&${DISABLED}`]: { cursor: "not-allowed" },
      "&:focus-visible": {
        outline: `2px solid ${vars.button.focusRing}`,
        outlineOffset: 2,
      },
    },
  },
  variants: {
    variant: {
      fill: variant(vars.button.fill),
      outline: variant(vars.button.outline),
      text: variant(vars.button.text),
    },
    size: {
      s: size(vars.button.size.s),
      m: size(vars.button.size.m),
      l: size(vars.button.size.l),
    },
  },
  defaultVariants: { variant: "fill", size: "s" },
});

export type ButtonVariants = RecipeVariants<typeof button>;
