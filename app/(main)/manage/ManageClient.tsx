"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Word {
  id: string;
  word: string;
  definition: string;
  example?: string;
  grade: number;
}

export default function ManageClient({ words: initial, grade }: { words: Word[]; grade: number }) {
  const router = useRouter();
  const [words, setWords] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ word: "", definition: "", example: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const res = await fetch("/api/words", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET ?? ""}`,
      },
      body: JSON.stringify([{ ...form, grade }]),
    });

    if (!res.ok) {
      // Fallback: insert directly via Supabase client (need insert policy)
      const supabase = createClient();
      const { data, error: err } = await supabase
        .from("words")
        .insert([{ ...form, grade }])
        .select()
        .single();

      if (err) {
        setError("단어 추가에 실패했어요.");
        setSaving(false);
        return;
      }
      setWords((prev) => [data, ...prev]);
    } else {
      const json = await res.json();
      setWords((prev) => [...json.words, ...prev]);
    }

    setForm({ word: "", definition: "", example: "" });
    setShowForm(false);
    setSaving(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("이 단어를 삭제할까요?")) return;
    const supabase = createClient();
    await supabase.from("words").delete().eq("id", id);
    setWords((prev) => prev.filter((w) => w.id !== id));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">단어 관리</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors"
        >
          {showForm ? "취소" : "+ 추가"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-white rounded-2xl shadow-sm p-5 mb-5 space-y-3">
          <h2 className="font-semibold text-gray-700">새 단어 추가 ({grade}학년)</h2>
          <input
            type="text"
            placeholder="영어 단어 (예: apple)"
            value={form.word}
            onChange={(e) => setForm((f) => ({ ...f, word: e.target.value }))}
            required
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
          />
          <input
            type="text"
            placeholder="뜻 (예: 사과. 빨갛고 둥근 과일)"
            value={form.definition}
            onChange={(e) => setForm((f) => ({ ...f, definition: e.target.value }))}
            required
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
          />
          <input
            type="text"
            placeholder="예문 (예: I eat an apple. (나는 사과를 먹는다.))"
            value={form.example}
            onChange={(e) => setForm((f) => ({ ...f, example: e.target.value }))}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 bg-blue-500 text-white rounded-xl text-sm font-semibold hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            {saving ? "저장 중..." : "저장"}
          </button>
        </form>
      )}

      <div className="space-y-2">
        {words.length === 0 && (
          <p className="text-center text-gray-400 py-10">단어가 없어요. 추가해보세요!</p>
        )}
        {words.map((word) => (
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
        ))}
      </div>
    </div>
  );
}
