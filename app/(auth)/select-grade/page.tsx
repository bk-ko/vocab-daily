"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const GRADES = [
  { value: "초4", label: "초등 4학년", emoji: "🏫", description: "초등학교 수준 영어 단어" },
  { value: "중1", label: "중학교 1학년", emoji: "🎒", description: "중학교 수준 영어 단어" },
];

export default function SelectGradePage() {
  const router = useRouter();
  const [current, setCurrent] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      const grade = user?.user_metadata?.grade ?? null;
      setCurrent(grade);
    });
  }, []);

  async function handleSelect(grade: string) {
    if (loading) return;
    setSelected(grade);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ data: { grade } });

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
          <h1 className="text-3xl font-bold text-blue-600">학년 선택</h1>
          <p className="text-gray-500 mt-1 text-sm">
            {current ? "학년을 변경할 수 있어요" : "학년에 맞는 단어를 배워요!"}
          </p>
        </div>

        <div className="space-y-4">
          {GRADES.map((g) => {
            const isCurrent = current === g.value;
            const isSelected = selected === g.value;
            return (
              <button
                key={g.value}
                onClick={() => handleSelect(g.value)}
                disabled={loading}
                className={`w-full bg-white rounded-2xl shadow-sm p-6 text-left transition-all hover:shadow-md active:scale-[0.98] disabled:opacity-50 ${
                  isSelected || isCurrent
                    ? "ring-2 ring-blue-500"
                    : "ring-1 ring-gray-100"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">{g.emoji}</span>
                    <div>
                      <p className="text-lg font-bold text-gray-800">{g.label}</p>
                      <p className="text-sm text-gray-500">{g.description}</p>
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
