import { createServerClient } from "@/lib/supabase/server";
import DashboardClient from "./DashboardClient";

type WordStatus = "known" | "unknown" | "bookmarked" | null;

export default async function DashboardPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const level = Number(user!.user_metadata?.level ?? 2);

  // passed된 단어 ID 목록 조회
  const { data: passedHistory } = await supabase
    .from("user_word_history")
    .select("word_id")
    .eq("user_id", user!.id)
    .eq("passed", true);

  const passedWordIds = new Set((passedHistory ?? []).map((h) => h.word_id));
  const totalPassedCount = passedWordIds.size;

  // passed 단어 제외하고 오늘 단어 조회
  const { data: allWords } = await supabase
    .from("words")
    .select("*")
    .eq("level", level)
    .order("created_at", { ascending: false })
    .limit(30);

  const words = (allWords ?? []).filter((w) => !passedWordIds.has(w.id)).slice(0, 10);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data: history } = await supabase
    .from("user_word_history")
    .select("word_id, quiz_result, bookmarked")
    .eq("user_id", user!.id)
    .gte("viewed_at", today.toISOString());

  const viewedWordIds = (history ?? []).map((h) => h.word_id);
  const wordStatuses: Record<string, WordStatus> = {};
  for (const h of history ?? []) {
    if (h.bookmarked) {
      wordStatuses[h.word_id] = "bookmarked";
    } else if (h.quiz_result === true) {
      wordStatuses[h.word_id] = "known";
    } else if (h.quiz_result === false) {
      wordStatuses[h.word_id] = "unknown";
    } else {
      wordStatuses[h.word_id] = null;
    }
  }

  return (
    <DashboardClient
      words={words}
      viewedWordIds={viewedWordIds}
      wordStatuses={wordStatuses}
      userId={user!.id}
      currentLevel={level}
      totalPassedCount={totalPassedCount}
    />
  );
}
