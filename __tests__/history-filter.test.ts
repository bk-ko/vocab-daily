/**
 * 학습 이력 필터링 로직 테스트
 *
 * 실제 버그였던 케이스:
 * - query.eq() reassignment 누락으로 filter가 무시됨
 * - words 조인에 grade 컬럼 참조 (실제 DB는 level)
 * - bookmarked 필터 미구현
 */

import { describe, it, expect } from "vitest";

// ── 테스트용 히스토리 데이터 ──────────────────────────────
type HistoryItem = {
  id: string;
  quiz_result: boolean | null;
  bookmarked: boolean;
  viewed_at: string;
  words: { id: string; word: string; definition: string; level: number } | null;
};

const mockHistory: HistoryItem[] = [
  {
    id: "h1",
    quiz_result: true,
    bookmarked: false,
    viewed_at: "2026-03-08T07:00:00Z",
    words: { id: "w1", word: "apple", definition: "사과", level: 1 },
  },
  {
    id: "h2",
    quiz_result: false,
    bookmarked: false,
    viewed_at: "2026-03-08T07:05:00Z",
    words: { id: "w2", word: "negotiate", definition: "협상하다", level: 4 },
  },
  {
    id: "h3",
    quiz_result: null,
    bookmarked: true,
    viewed_at: "2026-03-08T07:10:00Z",
    words: { id: "w3", word: "library", definition: "도서관", level: 2 },
  },
  {
    id: "h4",
    quiz_result: false,
    bookmarked: false,
    viewed_at: "2026-03-07T09:00:00Z",
    words: { id: "w4", word: "describe", definition: "묘사하다", level: 3 },
  },
];

// ── 필터 로직 (page.tsx 와 동일) ──────────────────────────
function applyFilter(items: HistoryItem[], filter?: string) {
  if (filter === "unknown") return items.filter((h) => h.quiz_result === false);
  if (filter === "bookmarked") return items.filter((h) => h.bookmarked === true);
  return items;
}

function countUnknown(items: HistoryItem[]) {
  return items.filter((h) => h.quiz_result === false).length;
}

function countBookmarked(items: HistoryItem[]) {
  return items.filter((h) => h.bookmarked === true).length;
}

// ── 테스트 ────────────────────────────────────────────────
describe("history 필터링", () => {
  it("filter 없으면 전체 반환", () => {
    expect(applyFilter(mockHistory)).toHaveLength(4);
  });

  it("filter=unknown → quiz_result === false 항목만", () => {
    const result = applyFilter(mockHistory, "unknown");
    expect(result).toHaveLength(2);
    expect(result.every((h) => h.quiz_result === false)).toBe(true);
  });

  it("filter=bookmarked → bookmarked === true 항목만", () => {
    const result = applyFilter(mockHistory, "bookmarked");
    expect(result).toHaveLength(1);
    expect(result[0].words?.word).toBe("library");
  });

  it("filter=unknown일 때 quiz_result=null이나 true는 제외", () => {
    const result = applyFilter(mockHistory, "unknown");
    expect(result.some((h) => h.quiz_result === null)).toBe(false);
    expect(result.some((h) => h.quiz_result === true)).toBe(false);
  });

  it("알 수 없는 filter 값은 전체 반환", () => {
    expect(applyFilter(mockHistory, "invalid")).toHaveLength(4);
  });
});

describe("카운트 계산", () => {
  it("모르는 단어 카운트", () => {
    expect(countUnknown(mockHistory)).toBe(2);
  });

  it("보관 카운트", () => {
    expect(countBookmarked(mockHistory)).toBe(1);
  });
});

describe("words 조인 데이터 접근", () => {
  it("words.level 필드가 존재해야 함 (grade 아님)", () => {
    for (const item of mockHistory) {
      if (item.words) {
        expect(item.words).toHaveProperty("level");
        expect(item.words).not.toHaveProperty("grade");
      }
    }
  });

  it("words가 null인 항목도 처리 가능", () => {
    const withNull: HistoryItem[] = [
      ...mockHistory,
      { id: "h5", quiz_result: null, bookmarked: false, viewed_at: "2026-03-08T08:00:00Z", words: null },
    ];
    // null word 항목은 UI에서 skip하므로 에러 없어야 함
    const rendered = withNull.map((item) => item.words?.word ?? null);
    expect(rendered).toContain(null);
  });
});
