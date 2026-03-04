import { createServerClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function HistoryPage() {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get history with word details, ordered by viewed_at desc
  const { data: history } = await supabase
    .from("user_word_history")
    .select(`
      id,
      viewed_at,
      quiz_result,
      words (
        id,
        word,
        definition,
        grade
      )
    `)
    .eq("user_id", user!.id)
    .order("viewed_at", { ascending: false })
    .limit(50);

  // Group by date
  const groupedByDate: Record<string, typeof history> = {};
  for (const item of history ?? []) {
    const date = new Date(item.viewed_at).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    if (!groupedByDate[date]) groupedByDate[date] = [];
    groupedByDate[date]!.push(item);
  }

  if ((history ?? []).length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-4xl mb-3">📋</p>
        <p className="font-medium text-gray-600">아직 학습 기록이 없어요</p>
        <p className="text-sm mt-1">오늘의 단어를 확인해 보세요!</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">학습 이력</h1>

      <div className="space-y-6">
        {Object.entries(groupedByDate).map(([date, items]) => {
          const correctCount = items!.filter((i) => i.quiz_result === true).length;
          const quizCount = items!.filter((i) => i.quiz_result !== null).length;

          return (
            <div key={date}>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold text-gray-500">{date}</h2>
                <span className="text-xs text-gray-400">
                  {items!.length}개 학습
                  {quizCount > 0 && ` · 퀴즈 ${correctCount}/${quizCount}`}
                </span>
              </div>

              <div className="space-y-2">
                {items!.map((item) => {
                  const word = Array.isArray(item.words) ? item.words[0] : item.words;
                  if (!word) return null;

                  return (
                    <Link
                      key={item.id}
                      href={`/word/${word.id}`}
                      className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div>
                        <p className="font-semibold text-gray-800">{word.word}</p>
                        <p className="text-sm text-gray-400 truncate max-w-[200px]">
                          {word.definition}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {item.quiz_result === true && (
                          <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">정답</span>
                        )}
                        {item.quiz_result === false && (
                          <span className="text-xs bg-red-100 text-red-500 px-2 py-0.5 rounded-full">오답</span>
                        )}
                        {item.quiz_result === null && (
                          <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">퀴즈 미응시</span>
                        )}
                        <span className="text-gray-300">›</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
