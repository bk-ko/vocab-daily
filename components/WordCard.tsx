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
  onKnown?: (wordId: string, known: boolean) => void;
  alreadyViewed?: boolean;
  knownStatus?: boolean | null; // true=알아요, false=몰라요, null=미선택
}

export default function WordCard({ word, onViewed, onKnown, alreadyViewed = false, knownStatus = null }: WordCardProps) {
  const [revealed, setRevealed] = useState(alreadyViewed);
  const [known, setKnown] = useState<boolean | null>(knownStatus);

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
    // "I have a dog. (나는 개를 키운다.)" → "I have a dog."
    const match = example.match(/^([^(（]+)/);
    return match ? match[1].trim() : example;
  }

  function handleKnown(e: React.MouseEvent, value: boolean) {
    e.stopPropagation();
    setKnown(value);
    onKnown?.(word.id, value);
  }

  return (
    <div
      onClick={handleTap}
      className={`bg-white rounded-2xl shadow-sm p-5 cursor-pointer transition-all active:scale-95 ${
        known === false
          ? "border-2 border-orange-200"
          : known === true
          ? "border-2 border-green-200"
          : revealed
          ? "border-2 border-blue-200"
          : "border-2 border-transparent"
      }`}
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
                title="예문 듣기"
              >
                🔊 <span>예문 듣기</span>
              </button>
            </div>
          )}

          {/* 알아요/몰라요 버튼 */}
          <div className="flex gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={(e) => handleKnown(e, true)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
                known === true
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-green-100 hover:text-green-600"
              }`}
            >
              👍 알아요
            </button>
            <button
              onClick={(e) => handleKnown(e, false)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
                known === false
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
