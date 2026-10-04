export const SIZES = ["s", "m", "l"] as const;
export type Size = (typeof SIZES)[number];
