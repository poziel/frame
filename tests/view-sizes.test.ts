import { test, expect } from "bun:test";
import { fitViewSizes } from "../packages/core/src/frame/viewSizes";
test("open subviews fill the region and share room without hiding any content", () => {
  expect(fitViewSizes([180], 600)).toEqual([600]);
  expect(fitViewSizes([180, 180, 180], 600)).toEqual([200, 200, 200]);
  expect(fitViewSizes([500, 100, 100], 300)).toEqual([180, 60, 60]);
  expect(fitViewSizes([500, 100, 100], 90)).toEqual([30, 30, 30]);
  expect(fitViewSizes([], 600)).toEqual([]);
});
test("temporary container shrink leaves preferred heights available for restoration", () => {
  const preferred = [400, 200];
  expect(fitViewSizes(preferred, 300)).toEqual([200, 100]);
  expect(preferred).toEqual([400, 200]);
  expect(fitViewSizes(preferred, 600)).toEqual([400, 200]);
});
