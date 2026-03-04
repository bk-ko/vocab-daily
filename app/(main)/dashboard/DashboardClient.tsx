"use client";

import { useState } from "react";
import WordCard from "@/components/WordCard";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

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
  knownStatuses: Record<string, boolean | null>;
  userId: string;
}

export default function DashboardClient({ words, viewedWordIds, knownStatuses, userId }: DashboardClientProps) {
  const [viewed, setViewed] = useState<Set<string>>(new Set(viewedWordIds));
  const [known, setKnown] = useState<Record<string, boolean | null>>(knownStatuses);

  async function handleWordViewed(wordId: string) {
    setViewed((prev) => new Set([...prev, wordId]));
    const supabase = createClient();
    await supabase.from("user_word_history").upsert(
      { user_id: userId, word_id: wordId, viewed_at: new Date().toISOString() },
      { onConflict: "user_id,word_id" }
    );
  }

  async function handleKnown(wordId: string, value: boolean) {
    setKnown((prev) => ({ ...prev, [wordId]: value }));
    const supabase = createClient();
    await supabase.from("user_word_history").upsert(
      { user_id: userId, word_id: wordId, quiz_result: value },
      { onConflict: "user_id,word_id" }
    );
  }

  const unknownCount = Object.values(known).filter((v) => v === false).length;

  const today = new Date().toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  return (
    <div>
      <div className="mb-5">
        <p className="text-sm text-gray-400">{today}</p>
        <h1 className="text-2xl font-bold text-gray-800 mt-1">오늘의 단어</h1>
        <div className="flex items-center gap-3 mt-1">
          <p className="text-sm text-gray-500">{viewed.size}/{words.length}개 확인</p>
          {unknownCount > 0 && (
            <Link href="/history?filter=unknown" className="text-sm text-orange-500 font-medium">
              ❓ 모르는 단어 {unknownCount}개
            </Link>
          )}
        </div>
      </div>

      <div className="bg-gray-200 rounded-full h-2 mb-6">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: words.length > 0 ? `${(viewed.size / words.length) * 100}%` : "0%" }}
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
              knownStatus={known[word.id] ?? null}
              onViewed={handleWordViewed}
              onKnown={handleKnown}
            />
          ))}
        </div>
      )}

      {viewed.size === words.length && words.length > 0 && (
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
    </div>
  );
}
