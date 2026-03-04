"use client";

import { useState } from "react";

interface QuizCardProps {
  question: string;
  word: string;
  options: string[];
  correctIndex: number;
  onAnswer: (isCorrect: boolean) => void;
}

export default function QuizCard({
  question,
  word,
  options,
  correctIndex,
  onAnswer,
}: QuizCardProps) {
  const [selected, setSelected] = useState<number | null>(null);

  function handleSelect(index: number) {
    if (selected !== null) return; // Already answered
    setSelected(index);
    const isCorrect = index === correctIndex;
    setTimeout(() => onAnswer(isCorrect), 800);
  }

  function getButtonStyle(index: number) {
    if (selected === null) {
      return "bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-300 active:scale-95";
    }
    if (index === correctIndex) {
      return "bg-green-500 border-2 border-green-500 text-white";
    }
    if (index === selected) {
      return "bg-red-400 border-2 border-red-400 text-white";
    }
    return "bg-white border-2 border-gray-200 text-gray-400";
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">퀴즈</p>
      <p className="text-base text-gray-600 mb-2">{question}</p>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">{word}</h2>

      <div className="space-y-3">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleSelect(index)}
            disabled={selected !== null}
            className={`w-full text-left px-4 py-3 rounded-xl text-base font-medium transition-all ${getButtonStyle(index)}`}
          >
            <span className="text-gray-400 mr-2">{String.fromCharCode(9312 + index)}</span>
            {option}
          </button>
        ))}
      </div>

      {selected !== null && (
        <p className={`text-center mt-4 font-semibold ${selected === correctIndex ? "text-green-500" : "text-red-400"}`}>
          {selected === correctIndex ? "정답이에요! 🎉" : "틀렸어요 😅"}
        </p>
      )}
    </div>
  );
}
