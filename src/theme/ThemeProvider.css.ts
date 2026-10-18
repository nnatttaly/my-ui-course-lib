import { style } from "@vanilla-extract/css";
import { vars } from "./theme.css";

export const root = style({
  minHeight: "100%",
  fontFamily: vars.font.family,
  color: vars.surface.text,
  background: vars.surface.bg,
});
