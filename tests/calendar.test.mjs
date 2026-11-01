import assert from "node:assert/strict";
import { test } from "node:test";
import {
  addDays,
  addMonths,
  clampDate,
  getMonthWeeks,
  isOutsideRange,
  isSameDay,
  startOfDay,
  startOfMonth,
} from "../src/components/Calendar/Calendar.utils.ts";

test("November 2026 follows each locale's first weekday and has empty outside cells", () => {
  const month = new Date(2026, 10, 17);
  for (const firstDay of [1, 0, 6]) {
    const weeks = getMonthWeeks(month, firstDay);
    const dates = weeks.flat().filter(Boolean);
    assert.equal(dates.length, 30);
    assert.deepEqual(
      dates.map((date) => date.getDate()),
      Array.from({ length: 30 }, (_, i) => i + 1),
    );
    assert.equal(weeks[0].findIndex(Boolean), (7 - firstDay) % 7);
    assert.equal(weeks.length, firstDay === 1 ? 6 : 5);
    assert.ok(weeks.every((week) => week.length === 7));
  }
});

test("leap years, year boundaries, and months with exactly four weeks", () => {
  assert.equal(
    getMonthWeeks(new Date(2024, 1), 1).flat().filter(Boolean).length,
    29,
  );
  assert.equal(getMonthWeeks(new Date(2021, 1), 1).length, 4);
  assert.ok(
    isSameDay(addMonths(new Date(2026, 11, 31), 1), new Date(2027, 0, 31)),
  );
  assert.ok(
    isSameDay(addMonths(new Date(2024, 1, 29), 12), new Date(2025, 1, 28)),
  );
  assert.ok(
    isSameDay(addMonths(new Date(2026, 0, 31), 1), new Date(2026, 1, 28)),
  );
});

test("date range includes both boundaries regardless of time", () => {
  const min = new Date(2026, 10, 10, 18);
  const max = new Date(2026, 10, 20, 3);
  assert.equal(isOutsideRange(new Date(2026, 10, 10), min, max), false);
  assert.equal(isOutsideRange(new Date(2026, 10, 20, 23), min, max), false);
  assert.equal(isOutsideRange(new Date(2026, 10, 9), min, max), true);
  assert.equal(isOutsideRange(new Date(2026, 10, 21), min, max), true);
  assert.ok(isSameDay(clampDate(new Date(2026, 9), min, max), min));
  assert.ok(isSameDay(clampDate(new Date(2026, 11), min, max), max));
});

test("calendar arithmetic preserves local days through daylight saving transitions", () => {
  for (const [month, day] of [
    [2, 8],
    [10, 1],
  ]) {
    const date = new Date(2026, month, day, 17);
    const next = addDays(date, 1);
    assert.equal(next.getDate(), day + 1);
    assert.equal(next.getHours(), 0);
    assert.equal(date.getHours(), 17);
    assert.equal(startOfMonth(date).getDate(), 1);
    assert.equal(startOfDay(date).getHours(), 0);
  }
});
