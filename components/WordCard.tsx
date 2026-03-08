"use client";

import { useState } from "react";

type WordStatus = "known" | "unknown" | "bookmarked" | null;

interface Word {
  id: string;
  word: string;
  definition: string;
  example?: string;
  grade: number;
}

interface WordCardProps {
  word: Word;
  onViewed?: (wordId: string) => void;
  onKnown?: (wordId: string, status: WordStatus) => void;
  alreadyViewed?: boolean;
  status?: WordStatus;
}

export default function WordCard({ word, onViewed, onKnown, alreadyViewed = false, status: initialStatus = null }: WordCardProps) {
  const [revealed, setRevealed] = useState(alreadyViewed);
  const [status, setStatus] = useState<WordStatus>(initialStatus);

  function handleTap() {
    if (!revealed) {
      setRevealed(true);
      onViewed?.(word.id);
    } else {
      setRevealed(false);
    }
  }

  function speak(e: React.MouseEvent, text: string) {
    e.stopPropagation();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  function getEnglishOnly(example: string) {
    const match = example.match(/^([^(（]+)/);
    return match ? match[1].trim() : example;
  }

  function handleStatus(e: React.MouseEvent, value: WordStatus) {
    e.stopPropagation();
    setStatus(value);
    onKnown?.(word.id, value);
  }

  const borderClass =
    status === "known"      ? "border-2 border-green-200"
    : status === "unknown"  ? "border-2 border-orange-200"
    : status === "bookmarked" ? "border-2 border-yellow-300"
    : revealed              ? "border-2 border-blue-200"
    :                         "border-2 border-transparent";

  return (
    <div
      onClick={handleTap}
      className={`bg-white rounded-2xl shadow-sm p-5 cursor-pointer transition-all active:scale-95 ${borderClass}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-gray-800">{word.word}</h2>
          {revealed && (
            <button
              onClick={(e) => speak(e, word.word)}
              className="text-blue-400 hover:text-blue-600 transition-colors p-1"
              title="발음 듣기"
            >
              🔊
            </button>
          )}
        </div>
        {!revealed && (
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">탭해서 보기</span>
        )}
      </div>

      {revealed ? (
        <div className="mt-2 space-y-2">
          <p className="text-gray-700 text-base leading-relaxed">{word.definition}</p>
          {word.example && (
            <div className="border-l-2 border-blue-200 pl-3 space-y-2">
              <p className="text-gray-500 text-sm italic">{word.example}</p>
              <button
                onClick={(e) => speak(e, getEnglishOnly(word.example!))}
                className="flex items-center gap-1.5 text-xs font-medium text-blue-400 hover:text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-all active:scale-95"
              >
                🔊 <span>예문 듣기</span>
              </button>
            </div>
          )}

          <div className="flex gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={(e) => handleStatus(e, "known")}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
                status === "known"
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-green-100 hover:text-green-600"
              }`}
            >
              👍 알아요
            </button>
            <button
              onClick={(e) => handleStatus(e, "bookmarked")}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
                status === "bookmarked"
                  ? "bg-yellow-400 text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-yellow-100 hover:text-yellow-600"
              }`}
            >
              🗂️ 일단보관
            </button>
            <button
              onClick={(e) => handleStatus(e, "unknown")}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
                status === "unknown"
                  ? "bg-orange-400 text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-orange-100 hover:text-orange-500"
              }`}
            >
              ❓ 몰라요
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-400 text-sm mt-2">단어를 탭하면 뜻이 나타나요</p>
      )}
    </div>
  );
}
