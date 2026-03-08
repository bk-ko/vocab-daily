import { createServerClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 전체 이력에서 count 집계 (필터 미적용)
  const { data: allHistory } = await supabase
    .from("user_word_history")
    .select("quiz_result, bookmarked")
    .eq("user_id", user!.id);

  const unknownCount  = (allHistory ?? []).filter((h) => h.quiz_result === false).length;
  const bookmarkCount = (allHistory ?? []).filter((h) => h.bookmarked === true).length;

  // 필터 조건을 transform 메서드(order/limit) 이전에 적용
  let query = supabase
    .from("user_word_history")
    .select(`id, viewed_at, quiz_result, bookmarked, words ( id, word, definition, level )`)
    .eq("user_id", user!.id);

  if (filter === "unknown") {
    query = query.eq("quiz_result", false);
  } else if (filter === "bookmarked") {
    query = query.eq("bookmarked", true);
  }

  const { data: history } = await query
    .order("viewed_at", { ascending: false })
    .limit(100);

  const groupedByDate: Record<string, typeof history> = {};
  for (const item of history ?? []) {
    const date = new Date(item.viewed_at).toLocaleDateString("ko-KR", {
      year: "numeric", month: "long", day: "numeric",
    });
    if (!groupedByDate[date]) groupedByDate[date] = [];
    groupedByDate[date]!.push(item);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">학습 이력</h1>

      {/* 필터 탭 */}
      <div className="flex gap-2 mb-6">
        <Link
          href="/history"
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            !filter ? "bg-blue-500 text-white" : "bg-white text-gray-500 hover:bg-gray-100"
          }`}
        >
          전체
        </Link>
        <Link
          href="/history?filter=unknown"
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            filter === "unknown" ? "bg-orange-400 text-white" : "bg-white text-gray-500 hover:bg-gray-100"
          }`}
        >
          ❓ 모르는 단어 {unknownCount > 0 && `(${unknownCount})`}
        </Link>
        <Link
          href="/history?filter=bookmarked"
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            filter === "bookmarked" ? "bg-yellow-400 text-white" : "bg-white text-gray-500 hover:bg-gray-100"
          }`}
        >
          🗂️ 보관 {bookmarkCount > 0 && `(${bookmarkCount})`}
        </Link>
      </div>

      {(history ?? []).length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">{filter === "unknown" ? "🎉" : "📋"}</p>
          <p className="font-medium text-gray-600">
            {filter === "unknown" ? "모르는 단어가 없어요!" : "아직 학습 기록이 없어요"}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByDate).map(([date, items]) => (
            <div key={date}>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold text-gray-500">{date}</h2>
                <span className="text-xs text-gray-400">{items!.length}개</span>
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
                        <p className="text-sm text-gray-400 truncate max-w-[200px]">{word.definition}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.quiz_result === true && (
                          <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">👍 알아요</span>
                        )}
                        {item.quiz_result === false && (
                          <span className="text-xs bg-orange-100 text-orange-500 px-2 py-0.5 rounded-full">❓ 몰라요</span>
                        )}
                        {item.quiz_result === null && (
                          <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">미선택</span>
                        )}
                        <span className="text-gray-300">›</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
