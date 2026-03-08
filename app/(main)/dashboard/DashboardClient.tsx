"use client";

import { useState } from "react";
import WordCard from "@/components/WordCard";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

type WordStatus = "known" | "unknown" | "bookmarked" | null;

interface Word {
  id: string;
  word: string;
  definition: string;
  example?: string;
  grade: number;
}

interface DashboardClientProps {
  words: Word[];
  viewedWordIds: string[];
  wordStatuses: Record<string, WordStatus>;
  userId: string;
}

export default function DashboardClient({ words, viewedWordIds, wordStatuses, userId }: DashboardClientProps) {
  const [viewed, setViewed] = useState<Set<string>>(new Set(viewedWordIds));
  const [statuses, setStatuses] = useState<Record<string, WordStatus>>(wordStatuses);

  async function handleWordViewed(wordId: string) {
    setViewed((prev) => new Set([...prev, wordId]));
    const supabase = createClient();
    await supabase.from("user_word_history").upsert(
      { user_id: userId, word_id: wordId, viewed_at: new Date().toISOString() },
      { onConflict: "user_id,word_id" }
    );
  }

  async function handleKnown(wordId: string, status: WordStatus) {
    setStatuses((prev) => ({ ...prev, [wordId]: status }));
    const supabase = createClient();
    await supabase.from("user_word_history").upsert(
      {
        user_id: userId,
        word_id: wordId,
        quiz_result: status === "known" ? true : status === "unknown" ? false : null,
        bookmarked: status === "bookmarked",
      },
      { onConflict: "user_id,word_id" }
    );
  }

  // 현재 카드 목록 기준으로만 진행 카운트 (오늘 전체 열람 수가 아님)
  const currentWordIds = new Set(words.map((w) => w.id));
  const viewedInCurrent = words.filter((w) => viewed.has(w.id)).length;

  const unknownCount  = Object.entries(statuses).filter(([id, v]) => currentWordIds.has(id) && v === "unknown").length;
  const bookmarkCount = Object.entries(statuses).filter(([id, v]) => currentWordIds.has(id) && v === "bookmarked").length;

  const today = new Date().toLocaleDateString("ko-KR", {
    month: "long", day: "numeric", weekday: "long",
  });

  return (
    <div>
      <div className="mb-5">
        <p className="text-sm text-gray-400">{today}</p>
        <h1 className="text-2xl font-bold text-gray-800 mt-1">오늘의 단어</h1>
        <div className="flex items-center gap-3 mt-1">
          <p className="text-sm text-gray-500">{viewedInCurrent}/{words.length}개 확인</p>
          {unknownCount > 0 && (
            <Link href="/history?filter=unknown" className="text-sm text-orange-500 font-medium">
              ❓ 모르는 단어 {unknownCount}개
            </Link>
          )}
          {bookmarkCount > 0 && (
            <Link href="/history?filter=bookmarked" className="text-sm text-yellow-500 font-medium">
              🗂️ 보관 {bookmarkCount}개
            </Link>
          )}
        </div>
      </div>

      <div className="bg-gray-200 rounded-full h-2 mb-6">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: words.length > 0 ? `${Math.min((viewedInCurrent / words.length) * 100, 100)}%` : "0%" }}
        />
      </div>

      {words.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📭</p>
          <p className="font-medium">단어가 아직 없어요</p>
          <Link href="/manage" className="mt-3 inline-block text-blue-500 text-sm font-medium">
            + 단어 추가하기
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {words.map((word) => (
            <WordCard
              key={word.id}
              word={word}
              alreadyViewed={viewed.has(word.id)}
              status={statuses[word.id] ?? null}
              onViewed={handleWordViewed}
              onKnown={handleKnown}
            />
          ))}
        </div>
      )}

      {viewedInCurrent === words.length && words.length > 0 && (
        <div className="mt-6 text-center bg-blue-50 rounded-2xl p-5">
          <p className="text-3xl mb-2">🎉</p>
          <p className="font-bold text-blue-700">오늘 단어를 모두 봤어요!</p>
          {unknownCount > 0 && (
            <Link href="/history?filter=unknown" className="mt-2 inline-block text-sm text-orange-500 font-medium">
              모르는 단어 {unknownCount}개 복습하기 →
            </Link>
          )}
        </div>
      )}

      {/* 단어 추가 버튼 */}
      <Link
        href="/manage"
        className="mt-6 flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 hover:border-blue-300 hover:text-blue-400 transition-colors text-sm font-medium"
      >
        <span className="text-lg">＋</span> 단어 추가하기
      </Link>
    </div>
  );
}
