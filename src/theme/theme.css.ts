import { createGlobalThemeContract, createTheme } from "@vanilla-extract/css";

/*
 * Контракт — это «форма» темы: список CSS-переменных без значений.
 * Любая тема (наша или пользовательская) обязана заполнить все токены,
 * иначе TypeScript не даст собрать проект.
 *
 * Кнопка: 3 варианта × 4 состояния × 3 свойства = 36 цветовых токенов.
 *
 * Global-контракт даёт стабильные имена без хешей: --ui-button-fill-hover-bg.
 * Их можно переопределить снаружи обычным CSS, без vanilla-extract.
 */
const stateTokens = { bg: null, text: null, border: null };

const variantTokens = {
  default: stateTokens,
  hover: stateTokens,
  active: stateTokens,
  disabled: stateTokens,
};

const sizeTokens = { height: null, paddingX: null, fontSize: null };

export const vars = createGlobalThemeContract(
  {
    font: { family: null },
    surface: { bg: null, text: null },
    button: {
      radius: null,
      focusRing: null,
      fill: variantTokens,
      outline: variantTokens,
      text: variantTokens,
      size: { s: sizeTokens, m: sizeTokens, l: sizeTokens },
    },
  },
  (_value, path) => `ui-${path.join("-")}`,
);

// Та же структура, что у контракта, только в листьях — значения токенов.
type Tokens<T> = {
  [K in keyof T]: T[K] extends string ? string : Tokens<T[K]>;
};
type ThemeValues = Tokens<typeof vars>;

// Общее для всех тем: геометрия и шрифт от цвета не зависят.
const shape = {
  font: { family: '"Inter", system-ui, sans-serif' },
  radius: "10px",
  size: {
    s: { height: "36px", paddingX: "16px", fontSize: "14px" },
    m: { height: "44px", paddingX: "20px", fontSize: "15px" },
    l: { height: "52px", paddingX: "24px", fontSize: "16px" },
  },
};

const light: ThemeValues = {
  font: shape.font,
  surface: { bg: "#ffffff", text: "#17171b" },
  button: {
    radius: shape.radius,
    focusRing: "#4c7dff",
    size: shape.size,
    fill: {
      default: { bg: "#17171b", text: "#ffffff", border: "transparent" },
      hover: { bg: "#2d2d33", text: "#ffffff", border: "transparent" },
      active: { bg: "#050506", text: "#ffffff", border: "transparent" },
      disabled: { bg: "#a2a2a4", text: "#ffffff", border: "transparent" },
    },
    outline: {
      default: { bg: "#ffffff", text: "#17171b", border: "#17171b" },
      hover: { bg: "#f4f4f5", text: "#17171b", border: "#17171b" },
      active: { bg: "#e7e7ea", text: "#17171b", border: "#17171b" },
      disabled: { bg: "#ffffff", text: "#a2a2a4", border: "#a2a2a4" },
    },
    text: {
      default: { bg: "transparent", text: "#17171b", border: "transparent" },
      hover: { bg: "#f4f4f5", text: "#17171b", border: "transparent" },
      active: { bg: "#e7e7ea", text: "#17171b", border: "transparent" },
      disabled: { bg: "transparent", text: "#a2a2a4", border: "transparent" },
    },
  },
};

const dark: ThemeValues = {
  font: shape.font,
  surface: { bg: "#17171b", text: "#f4f4f5" },
  button: {
    radius: shape.radius,
    focusRing: "#7c9dff",
    size: shape.size,
    fill: {
      default: { bg: "#f4f4f5", text: "#17171b", border: "transparent" },
      hover: { bg: "#dcdce0", text: "#17171b", border: "transparent" },
      active: { bg: "#ffffff", text: "#17171b", border: "transparent" },
      disabled: { bg: "#5a5a60", text: "#17171b", border: "transparent" },
    },
    outline: {
      default: { bg: "#17171b", text: "#f4f4f5", border: "#f4f4f5" },
      hover: { bg: "#2d2d33", text: "#f4f4f5", border: "#f4f4f5" },
      active: { bg: "#3a3a41", text: "#f4f4f5", border: "#f4f4f5" },
      disabled: { bg: "#17171b", text: "#5a5a60", border: "#5a5a60" },
    },
    text: {
      default: { bg: "transparent", text: "#f4f4f5", border: "transparent" },
      hover: { bg: "#2d2d33", text: "#f4f4f5", border: "transparent" },
      active: { bg: "#3a3a41", text: "#f4f4f5", border: "transparent" },
      disabled: { bg: "transparent", text: "#5a5a60", border: "transparent" },
    },
  },
};

export const lightTheme = createTheme(vars, light);
export const darkTheme = createTheme(vars, dark);
