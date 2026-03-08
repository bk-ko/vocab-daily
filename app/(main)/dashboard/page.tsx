import { createServerClient } from "@/lib/supabase/server";
import DashboardClient from "./DashboardClient";

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
    .select("word_id, quiz_result")
    .eq("user_id", user!.id)
    .gte("viewed_at", today.toISOString());

  const viewedWordIds = (history ?? []).map((h) => h.word_id);
  const knownStatuses: Record<string, boolean | null> = {};
  for (const h of history ?? []) {
    knownStatuses[h.word_id] = h.quiz_result;
  }

  return (
    <DashboardClient
      words={words ?? []}
      viewedWordIds={viewedWordIds}
      knownStatuses={knownStatuses}
      userId={user!.id}
    />
  );
}
