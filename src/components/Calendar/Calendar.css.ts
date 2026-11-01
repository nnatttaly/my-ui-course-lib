import { style } from "@vanilla-extract/css";
import { vars } from "../../theme/theme.css";

const t = vars.calendar;

export const root = style({
  boxSizing: "border-box",
  width: t.width,
  maxWidth: "100%",
  paddingBlock: t.padding,
  paddingInline: t.padding,
  border: `${t.borderWidth} solid ${t.border}`,
  borderRadius: t.radius,
  background: t.bg,
  color: t.text,
  fontFamily: vars.font.family,
  fontSize: t.fontSize,
  fontWeight: t.fontWeight,
  lineHeight: t.lineHeight,
});

export const header = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: t.gap,
  marginBlockEnd: t.sectionGap,
});

export const heading = style({
  margin: 0,
  fontSize: t.headingSize,
  fontWeight: t.selectedWeight,
  textAlign: "center",
});

export const navigation = style({
  selectors: {
    [`${root} &`]: {
      minWidth: t.daySize,
      width: t.daySize,
      height: t.daySize,
      padding: 0,
      borderRadius: t.dayRadius,
      flexShrink: 0,
    },
  },
});

export const icon = style({
  display: "block",
  width: t.iconSize,
  height: t.iconSize,
  strokeWidth: t.iconStroke,
  flexShrink: 0,
});

export const chevron = style({
  selectors: { [`${root}[dir="rtl"] &`]: { transform: "scaleX(-1)" } },
});

export const grid = style({
  width: "100%",
  tableLayout: "fixed",
  borderSpacing: 0,
});

export const weekday = style({
  height: t.daySize,
  padding: 0,
  fontWeight: t.fontWeight,
  color: t.muted,
  textAlign: "center",
});

export const cell = style({
  height: `calc(${t.daySize} + ${t.gap})`,
  padding: 0,
  textAlign: "center",
});

export const day = style({
  position: "relative",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  boxSizing: "border-box",
  width: "100%",
  maxWidth: t.daySize,
  height: t.daySize,
  padding: 0,
  border: `${t.borderWidth} solid transparent`,
  borderRadius: t.dayRadius,
  font: "inherit",
  color: t.text,
  background: "transparent",
  cursor: "pointer",
  selectors: {
    '&[data-weekend="true"]': { color: t.muted },
    '&:hover:not([aria-disabled="true"])': { background: t.hover },
    '&:active:not([aria-disabled="true"])': { background: t.active },
    '&[aria-current="date"]': { color: t.text, fontWeight: t.selectedWeight },
    '&[data-selected="true"]': {
      color: t.selectedText,
      background: t.selectedBg,
      fontWeight: t.selectedWeight,
    },
    '&[data-selected="true"]:hover:not([aria-disabled="true"]), &[data-selected="true"]:active:not([aria-disabled="true"])':
      {
        background: t.selectedHover,
      },
    '&[aria-current="date"]::after': {
      content: '""',
      position: "absolute",
      insetBlockEnd: t.dotOffset,
      width: t.dotSize,
      height: t.dotSize,
      borderRadius: "50%",
      background: "currentColor",
    },
    '&[aria-disabled="true"]': { color: t.disabled, cursor: "not-allowed" },
    "&:focus-visible": {
      outline: `${t.focusWidth} solid ${t.focusRing}`,
      outlineOffset: t.focusOffset,
    },
  },
});

export const footer = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: t.gap,
  marginBlockStart: t.sectionGap,
  paddingBlockStart: t.sectionGap,
  borderBlockStart: `${t.borderWidth} solid ${t.border}`,
});

export const selectedDate = style({ color: t.muted });

export const today = style({
  selectors: {
    [`${root} &`]: {
      height: t.daySize,
      borderRadius: t.dayRadius,
      flexShrink: 0,
    },
  },
});
