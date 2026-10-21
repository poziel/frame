import { expect, test } from "bun:test";
import { fitOverlay, intersectOverlayBounds } from "../packages/core/src/frame/overlays";

test("oversized overlays shrink inside an offset body without covering either bar", () => {
  expect(fitOverlay({ left: -20, top: 0, width: 900, height: 800 }, { left: 40, top: 34, width: 700, height: 312 })).toEqual({ left: 46, top: 40, width: 688, height: 300 });
});

test("an overlay moving beyond the status bar is clamped within its body", () => {
  expect(fitOverlay({ left: 720, top: 740, width: 100, height: 60 }, { left: 20, top: 34, width: 800, height: 712 })).toEqual({ left: 714, top: 680, width: 100, height: 60 });
});

test("embedded workbenches use only the visible intersection of their body and viewport", () => {
  expect(intersectOverlayBounds({ left: 100, top: 70, width: 900, height: 800 }, { left: 0, top: 0, width: 800, height: 600 })).toEqual({ left: 100, top: 70, width: 700, height: 530 });
});

test("tiny workbench bodies do not produce negative overlay dimensions", () => {
  expect(fitOverlay({ left: 0, top: 0, width: 200, height: 100 }, { left: 0, top: 34, width: 5, height: 4 })).toEqual({ left: 2.5, top: 36, width: 0, height: 0 });
});
