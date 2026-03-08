"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const GRADES = [
  { value: "초4", label: "초등 4학년", emoji: "🏫", description: "초등학교 수준 영어 단어" },
  { value: "중1", label: "중학교 1학년", emoji: "🎒", description: "중학교 수준 영어 단어" },
];

export default function SelectGradePage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSelect(grade: string) {
    setSelected(grade);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      data: { grade },
    });

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
          <p className="text-gray-500 mt-1 text-sm">학년에 맞는 단어를 배워요!</p>
        </div>

        <div className="space-y-4">
          {GRADES.map((g) => (
            <button
              key={g.value}
              onClick={() => handleSelect(g.value)}
              disabled={loading}
              className={`w-full bg-white rounded-2xl shadow-sm p-6 text-left transition-all hover:shadow-md active:scale-[0.98] disabled:opacity-50 ${
                selected === g.value ? "ring-2 ring-blue-500" : ""
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="text-4xl">{g.emoji}</span>
                <div>
                  <p className="text-lg font-bold text-gray-800">{g.label}</p>
                  <p className="text-sm text-gray-500">{g.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
