import { createServerClient } from "@/lib/supabase/server";
import DashboardClient from "./DashboardClient";

type WordStatus = "known" | "unknown" | "bookmarked" | null;

export default async function DashboardPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const gradeLabel = user!.user_metadata?.grade as string | undefined;
  const grade = gradeLabel === "중1" ? 7 : 4;

  const { data: words } = await supabase
    .from("words")
    .select("*")
    .eq("grade", grade)
    .order("created_at", { ascending: false })
    .limit(10);

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
      words={words ?? []}
      viewedWordIds={viewedWordIds}
      wordStatuses={wordStatuses}
      userId={user!.id}
    />
  );
}
