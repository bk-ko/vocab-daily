"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const LEVELS = [
  { value: 1, label: "초등 기초", emoji: "🌱", description: "초3-4 수준 · 아주 쉬운 일상단어", cefr: "A1" },
  { value: 2, label: "초등 심화", emoji: "📗", description: "초5-6 수준 · 중간 난이도", cefr: "A2" },
  { value: 3, label: "중학 기초", emoji: "📘", description: "중1-2 수준 · 다소 어려운 단어", cefr: "B1" },
  { value: 4, label: "중학 심화", emoji: "📙", description: "중3-고1 수준 · 어려운 단어", cefr: "B1+" },
];

export default function SelectGradePage() {
  const router = useRouter();
  const [current, setCurrent] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      const level = user?.user_metadata?.level ?? null;
      setCurrent(level != null ? Number(level) : null);
    });
  }, []);

  async function handleSelect(level: number) {
    if (loading) return;
    setSelected(level);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ data: { level } });

    if (error) {
      setLoading(false);
      setSelected(null);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">📚</div>
          <h1 className="text-3xl font-bold text-blue-600">레벨 선택</h1>
          <p className="text-gray-500 mt-1 text-sm">
            {current ? "레벨을 변경할 수 있어요" : "나에게 맞는 레벨을 골라요!"}
          </p>
        </div>

        <div className="space-y-3">
          {LEVELS.map((l) => {
            const isCurrent = current === l.value;
            const isSelected = selected === l.value;
            return (
              <button
                key={l.value}
                onClick={() => handleSelect(l.value)}
                disabled={loading}
                className={`w-full bg-white rounded-2xl shadow-sm p-5 text-left transition-all hover:shadow-md active:scale-[0.98] disabled:opacity-50 ${
                  isSelected || isCurrent
                    ? "ring-2 ring-blue-500"
                    : "ring-1 ring-gray-100"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{l.emoji}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-lg font-bold text-gray-800">{l.label}</p>
                        <span className="text-xs bg-gray-100 text-gray-500 font-medium px-1.5 py-0.5 rounded">
                          {l.cefr}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{l.description}</p>
                    </div>
                  </div>
                  {isCurrent && !isSelected && (
                    <span className="text-xs bg-blue-100 text-blue-600 font-semibold px-2 py-1 rounded-full whitespace-nowrap">
                      현재
                    </span>
                  )}
                  {isSelected && (
                    <span className="text-xs bg-green-100 text-green-600 font-semibold px-2 py-1 rounded-full whitespace-nowrap">
                      변경 중...
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {current && (
          <button
            onClick={() => router.back()}
            className="mt-6 w-full py-3 text-gray-400 text-sm hover:text-gray-600 transition-colors"
          >
            취소
          </button>
        )}
      </div>
    </div>
  );
}
