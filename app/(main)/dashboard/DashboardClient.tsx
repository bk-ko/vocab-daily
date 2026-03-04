"use client";

import { useState } from "react";
import WordCard from "@/components/WordCard";
import { createClient } from "@/lib/supabase/client";

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
  userId: string;
}

export default function DashboardClient({ words, viewedWordIds, userId }: DashboardClientProps) {
  const [viewed, setViewed] = useState<Set<string>>(new Set(viewedWordIds));

  async function handleWordViewed(wordId: string) {
    setViewed((prev) => new Set([...prev, wordId]));

    // Upsert to history
    const supabase = createClient();
    await supabase.from("user_word_history").upsert(
      {
        user_id: userId,
        word_id: wordId,
        viewed_at: new Date().toISOString(),
      },
      { onConflict: "user_id,word_id" }
    );
  }

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
        <p className="text-sm text-gray-500 mt-1">
          {viewed.size}/{words.length}개 확인 완료
        </p>
      </div>

      {/* Progress bar */}
      <div className="bg-gray-200 rounded-full h-2 mb-6">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: words.length > 0 ? `${(viewed.size / words.length) * 100}%` : "0%" }}
        />
      </div>

      {words.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📭</p>
          <p className="font-medium">오늘의 단어가 아직 없어요</p>
          <p className="text-sm mt-1">잠시 후 다시 확인해 주세요</p>
        </div>
      ) : (
        <div className="space-y-3">
          {words.map((word) => (
            <WordCard
              key={word.id}
              word={word}
              alreadyViewed={viewed.has(word.id)}
              onViewed={handleWordViewed}
            />
          ))}
        </div>
      )}

      {viewed.size === words.length && words.length > 0 && (
        <div className="mt-6 text-center bg-blue-50 rounded-2xl p-5">
          <p className="text-3xl mb-2">🎉</p>
          <p className="font-bold text-blue-700">오늘 단어를 모두 봤어요!</p>
          <p className="text-sm text-blue-500 mt-1">퀴즈로 복습해 볼까요?</p>
        </div>
      )}
    </div>
  );
}
