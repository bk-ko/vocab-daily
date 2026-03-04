"use client";

import { useState, useMemo } from "react";
import QuizCard from "@/components/QuizCard";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

interface Word {
  id: string;
  word: string;
  definition: string;
  example?: string;
  grade: number;
}

interface QuizClientProps {
  words: Word[];
  distractors: string[];
  userId: string;
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function QuizClient({ words, distractors, userId }: QuizClientProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const [finished, setFinished] = useState(false);

  // Shuffle words once on mount
  const quizWords = useMemo(() => shuffle(words), [words]);

  // Build options for each word: 1 correct + 3 random distractors
  const quizOptions = useMemo(() => {
    return quizWords.map((word) => {
      const wrongOptions = shuffle(
        distractors.filter((d) => d !== word.definition)
      ).slice(0, 3);

      const allOptions = shuffle([word.definition, ...wrongOptions]);
      const correctIndex = allOptions.indexOf(word.definition);
      return { options: allOptions, correctIndex };
    });
  }, [quizWords, distractors]);

  async function handleAnswer(isCorrect: boolean) {
    const word = quizWords[currentIndex];

    // Save quiz result to history
    const supabase = createClient();
    await supabase.from("user_word_history").upsert(
      {
        user_id: userId,
        word_id: word.id,
        quiz_result: isCorrect,
      },
      { onConflict: "user_id,word_id" }
    );

    const newResults = [...results, isCorrect];
    setResults(newResults);

    if (currentIndex + 1 >= quizWords.length) {
      setFinished(true);
    } else {
      setTimeout(() => setCurrentIndex((i) => i + 1), 900);
    }
  }

  if (finished) {
    const correct = results.filter(Boolean).length;
    const total = quizWords.length;
    const score = Math.round((correct / total) * 100);

    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4">{score >= 80 ? "🏆" : score >= 60 ? "👍" : "💪"}</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">퀴즈 완료!</h2>
        <p className="text-gray-500 mb-6">
          {total}문제 중 {correct}문제 정답
        </p>

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="text-4xl font-bold text-blue-500 mb-1">{score}점</div>
          <div className="bg-gray-200 rounded-full h-3 mt-3">
            <div
              className={`h-3 rounded-full transition-all ${score >= 80 ? "bg-green-500" : score >= 60 ? "bg-yellow-400" : "bg-red-400"}`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>

        <div className="space-y-2">
          {quizWords.map((word, i) => (
            <div
              key={word.id}
              className={`flex items-center justify-between bg-white rounded-xl p-3 shadow-sm`}
            >
              <span className="font-medium text-gray-700">{word.word}</span>
              <span className={results[i] ? "text-green-500" : "text-red-400"}>
                {results[i] ? "✓ 정답" : "✗ 오답"}
              </span>
            </div>
          ))}
        </div>

        <Link
          href="/dashboard"
          className="mt-6 inline-block w-full py-3 bg-blue-500 text-white rounded-xl font-semibold text-base hover:bg-blue-600 transition-colors"
        >
          대시보드로 돌아가기
        </Link>
      </div>
    );
  }

  const current = quizWords[currentIndex];
  const { options, correctIndex } = quizOptions[currentIndex];

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-gray-800">퀴즈</h1>
        <span className="text-sm text-gray-400">
          {currentIndex + 1} / {quizWords.length}
        </span>
      </div>

      {/* Progress */}
      <div className="bg-gray-200 rounded-full h-2 mb-6">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all"
          style={{ width: `${((currentIndex) / quizWords.length) * 100}%` }}
        />
      </div>

      <QuizCard
        key={current.id}
        question="이 단어의 뜻은 무엇일까요?"
        word={current.word}
        options={options}
        correctIndex={correctIndex}
        onAnswer={handleAnswer}
      />
    </div>
  );
}
