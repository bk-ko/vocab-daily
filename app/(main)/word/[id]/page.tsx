import { createServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function WordDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createServerClient();

  const { data: word } = await supabase
    .from("words")
    .select("*")
    .eq("id", id)
    .single();

  if (!word) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Check quiz result for this word
  const { data: history } = await supabase
    .from("user_word_history")
    .select("quiz_result, viewed_at")
    .eq("user_id", user!.id)
    .eq("word_id", id)
    .single();

  return (
    <div>
      <Link href="/dashboard" className="text-blue-500 text-sm flex items-center gap-1 mb-5">
        ← 돌아가기
      </Link>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="text-xs text-gray-400 mb-1">{word.grade}학년 단어</div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4">{word.word}</h1>

        <div className="border-t border-gray-100 pt-4 space-y-4">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">뜻</p>
            <p className="text-lg text-gray-700 leading-relaxed">{word.definition}</p>
          </div>

          {word.example && (
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">예문</p>
              <p className="text-base text-gray-600 italic bg-gray-50 rounded-xl p-3">
                {word.example}
              </p>
            </div>
          )}
        </div>
      </div>

      {history && (
        <div className="mt-4 bg-white rounded-2xl shadow-sm p-4">
          <p className="text-sm text-gray-500">
            학습일:{" "}
            {new Date(history.viewed_at).toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          {history.quiz_result !== null && (
            <p className={`text-sm mt-1 font-medium ${history.quiz_result ? "text-green-500" : "text-red-400"}`}>
              퀴즈 결과: {history.quiz_result ? "정답 ✓" : "오답 ✗"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
