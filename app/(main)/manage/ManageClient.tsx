"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const LEVEL_LABELS: Record<number, string> = {
  1: "🌱 초등 기초",
  2: "📗 초등 심화",
  3: "📘 중학 기초",
  4: "📙 중학 심화",
};

interface Word {
  id: string;
  word: string;
  definition: string;
  example?: string;
  level: number;
}

export default function ManageClient({ words: initial, level }: { words: Word[]; level: number }) {
  const router = useRouter();
  const [words, setWords] = useState(initial);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState("");

  async function handleGenerate() {
    setGenerating(true);
    setMessage("");

    try {
      const res = await fetch("/api/words/generate", { method: "POST" });
      const json = await res.json();

      if (!res.ok) {
        setMessage(json.error ?? "오류가 발생했어요");
      } else if (json.inserted === 0) {
        setMessage(json.message ?? "새 단어가 없어요");
      } else {
        setMessage(`✅ ${json.inserted}개 단어가 추가됐어요!`);
        router.refresh();
      }
    } catch {
      setMessage("네트워크 오류가 발생했어요");
    } finally {
      setGenerating(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("이 단어를 삭제할까요?")) return;
    const supabase = createClient();
    await supabase.from("words").delete().eq("id", id);
    setWords((prev) => prev.filter((w) => w.id !== id));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">단어 관리</h1>
          <p className="text-sm text-gray-400 mt-0.5">{LEVEL_LABELS[level]} · 총 {words.length}개</p>
        </div>
      </div>

      {/* AI 생성 버튼 */}
      <button
        onClick={handleGenerate}
        disabled={generating}
        className="w-full py-4 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 disabled:opacity-60 text-white rounded-2xl font-semibold text-base transition-colors flex items-center justify-center gap-2 mb-3"
      >
        {generating ? (
          <>
            <span className="animate-spin">⏳</span> AI가 단어 생성 중...
          </>
        ) : (
          <>✨ AI로 단어 15개 자동 생성</>
        )}
      </button>

      {message && (
        <p className={`text-sm text-center mb-4 font-medium ${message.startsWith("✅") ? "text-green-600" : "text-red-500"}`}>
          {message}
        </p>
      )}

      {/* 단어 목록 */}
      <div className="space-y-2">
        {words.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📭</p>
            <p className="font-medium">단어가 없어요. 위 버튼으로 생성해보세요!</p>
          </div>
        ) : (
          words.map((word) => (
            <div key={word.id} className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800">{word.word}</p>
                <p className="text-sm text-gray-400 truncate">{word.definition}</p>
              </div>
              <button
                onClick={() => handleDelete(word.id)}
                className="ml-3 text-gray-300 hover:text-red-400 transition-colors text-lg flex-shrink-0"
              >
                🗑
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
