/**
 * 대시보드 진행률 계산 테스트
 *
 * 실제 버그였던 케이스:
 * - viewed.size가 오늘 전체 열람 수 (28) vs words.length (10) → 진행률 280%
 * - 현재 카드 목록 기준으로만 계산해야 함
 */

import { describe, it, expect } from "vitest";

type Word = { id: string; word: string };

const currentWords: Word[] = [
  { id: "w1", word: "apple" },
  { id: "w2", word: "banana" },
  { id: "w3", word: "cat" },
  { id: "w4", word: "dog" },
  { id: "w5", word: "elephant" },
];

// 오늘 열람한 전체 ID (현재 카드 외에 다른 단어도 포함)
const allViewedIds = new Set<string>(["w1", "w2", "w8", "w9", "w10", "w11"]);

// ── 대시보드 진행률 로직 (DashboardClient와 동일) ────────
function calcProgress(words: Word[], viewed: Set<string>) {
  const viewedInCurrent = words.filter((w) => viewed.has(w.id)).length;
  const percent = words.length > 0
    ? Math.min((viewedInCurrent / words.length) * 100, 100)
    : 0;
  return { viewedInCurrent, percent };
}

// ── 테스트 ────────────────────────────────────────────────
describe("대시보드 진행률", () => {
  it("현재 목록 중 열람한 것만 카운트 (전체 열람 수 아님)", () => {
    const { viewedInCurrent } = calcProgress(currentWords, allViewedIds);
    // allViewedIds = {w1, w2, w8, w9, w10, w11} 중 currentWords와 교집합 = w1, w2 → 2
    expect(viewedInCurrent).toBe(2);
  });

  it("진행률이 100%를 넘지 않음", () => {
    // viewed가 words보다 훨씬 많아도 최대 100%
    const bigViewed = new Set(["w1","w2","w3","w4","w5","w6","w7","w8","w9","w10"]);
    const { percent } = calcProgress(currentWords, bigViewed);
    expect(percent).toBeLessThanOrEqual(100);
  });

  it("5/5 열람 시 100%", () => {
    const fullViewed = new Set(currentWords.map((w) => w.id));
    const { percent, viewedInCurrent } = calcProgress(currentWords, fullViewed);
    expect(viewedInCurrent).toBe(5);
    expect(percent).toBe(100);
  });

  it("미열람 시 0%", () => {
    const { percent } = calcProgress(currentWords, new Set());
    expect(percent).toBe(0);
  });

  it("words가 없을 때 0% (division by zero 방지)", () => {
    const { percent } = calcProgress([], new Set(["w1"]));
    expect(percent).toBe(0);
  });
});
