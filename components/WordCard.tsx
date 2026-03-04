"use client";

import { useState } from "react";

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
  alreadyViewed?: boolean;
}

export default function WordCard({ word, onViewed, alreadyViewed = false }: WordCardProps) {
  const [revealed, setRevealed] = useState(alreadyViewed);

  function handleTap() {
    if (!revealed) {
      setRevealed(true);
      onViewed?.(word.id);
    }
  }

  return (
    <div
      onClick={handleTap}
      className={`bg-white rounded-2xl shadow-sm p-5 cursor-pointer transition-all active:scale-95 ${
        revealed ? "border-2 border-blue-200" : "border-2 border-transparent"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold text-gray-800">{word.word}</h2>
        {revealed ? (
          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-medium">확인완료</span>
        ) : (
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">탭해서 보기</span>
        )}
      </div>

      {revealed ? (
        <div className="mt-3 space-y-2">
          <p className="text-gray-700 text-base leading-relaxed">{word.definition}</p>
          {word.example && (
            <p className="text-gray-500 text-sm italic border-l-2 border-blue-200 pl-3">
              예) {word.example}
            </p>
          )}
        </div>
      ) : (
        <p className="text-gray-400 text-sm mt-2">단어를 탭하면 뜻이 나타나요</p>
      )}
    </div>
  );
}
