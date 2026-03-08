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
  level: number;
}

interface QuizClientProps {
  words: Word[];
  distractors: string[];
  userId: string;
  mode?: "today" | "review";
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function QuizClient({ words, distractors, userId, mode = "today" }: QuizClientProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const [finished, setFinished] = useState(false);
  const [retryMode, setRetryMode] = useState(false);
  const [retryWords, setRetryWords] = useState<Word[]>([]);

  // Shuffle words once on mount
  const quizWords = useMemo(() => shuffle(words), [words]);

  // Build options: 1 correct + up to 3 distractors (fallback to fewer if not enough)
  const buildOptions = (word: Word, pool: string[]) => {
    const wrongPool = pool.filter((d) => d !== word.definition);
    const wrongOptions = shuffle(wrongPool).slice(0, Math.min(3, wrongPool.length));
    const allOptions = shuffle([word.definition, ...wrongOptions]);
    return { options: allOptions, correctIndex: allOptions.indexOf(word.definition) };
  };

  const activeWords = retryMode ? retryWords : quizWords;

  const quizOptions = useMemo(() => {
    return activeWords.map((word) => buildOptions(word, distractors));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWords, distractors]);

  async function handleAnswer(isCorrect: boolean) {
    const word = activeWords[currentIndex];

    // 오늘 퀴즈 모드일 때만 DB에 결과 저장 (복습 재도전은 저장 안 함)
    if (!retryMode) {
      const supabase = createClient();
      await supabase.from("user_word_history").upsert(
        {
          user_id: userId,
          word_id: word.id,
          quiz_result: isCorrect,
        },
        { onConflict: "user_id,word_id" }
      );
    }

    const newResults = [...results, isCorrect];
    setResults(newResults);

    if (currentIndex + 1 >= activeWords.length) {
      setFinished(true);
    } else {
      setTimeout(() => setCurrentIndex((i) => i + 1), 900);
    }
  }

  function handleRetry() {
    const wrongWords = activeWords.filter((_, i) => !results[i]);
    setRetryWords(wrongWords);
    setRetryMode(true);
    setCurrentIndex(0);
    setResults([]);
    setFinished(false);
  }

  if (finished) {
    const correct = results.filter(Boolean).length;
    const total = activeWords.length;
    const score = Math.round((correct / total) * 100);
    const wrongCount = total - correct;

    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4">{score >= 80 ? "🏆" : score >= 60 ? "👍" : "💪"}</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {retryMode ? "재도전 완료!" : "퀴즈 완료!"}
        </h2>
        <p className="text-gray-500 mb-6">
          {total}문제 중 {correct}문제 정답
        </p>

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
          <div className="text-4xl font-bold text-blue-500 mb-1">{score}점</div>
          <div className="bg-gray-200 rounded-full h-3 mt-3">
            <div
              className={`h-3 rounded-full transition-all ${score >= 80 ? "bg-green-500" : score >= 60 ? "bg-yellow-400" : "bg-red-400"}`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>

        <div className="space-y-2 mb-6 text-left">
          {activeWords.map((word, i) => (
            <div
              key={word.id}
              className="flex items-center justify-between bg-white rounded-xl p-3 shadow-sm"
            >
              <span className="font-medium text-gray-700">{word.word}</span>
              <span className={results[i] ? "text-green-500" : "text-red-400"}>
                {results[i] ? "✓ 정답" : "✗ 오답"}
              </span>
            </div>
          ))}
        </div>

        {wrongCount > 0 && (
          <button
            onClick={handleRetry}
            className="w-full py-3 mb-3 bg-orange-400 text-white rounded-xl font-semibold text-base hover:bg-orange-500 transition-colors"
          >
            💪 틀린 {wrongCount}문제 다시 풀기
          </button>
        )}

        <Link
          href={mode === "review" ? "/history?filter=unknown" : "/dashboard"}
          className="inline-block w-full py-3 bg-blue-500 text-white rounded-xl font-semibold text-base hover:bg-blue-600 transition-colors"
        >
          {mode === "review" ? "학습 이력으로 돌아가기" : "대시보드로 돌아가기"}
        </Link>
      </div>
    );
  }

  const current = activeWords[currentIndex];
  const { options, correctIndex } = quizOptions[currentIndex];

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-gray-800">
          {retryMode ? "💪 재도전" : mode === "review" ? "📚 복습 퀴즈" : "퀴즈"}
        </h1>
        <span className="text-sm text-gray-400">
          {currentIndex + 1} / {activeWords.length}
        </span>
      </div>

      {/* Progress */}
      <div className="bg-gray-200 rounded-full h-2 mb-6">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all"
          style={{ width: `${(currentIndex / activeWords.length) * 100}%` }}
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
