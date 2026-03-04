import { createServerClient } from "@/lib/supabase/server";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("grade")
    .eq("id", user!.id)
    .single();

  const grade = profile?.grade ?? 3;

  // Get today's words (most recent 10 for the grade)
  const { data: words } = await supabase
    .from("words")
    .select("*")
    .eq("grade", grade)
    .order("created_at", { ascending: false })
    .limit(10);

  // Get already-viewed word IDs for today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data: viewedHistory } = await supabase
    .from("user_word_history")
    .select("word_id")
    .eq("user_id", user!.id)
    .gte("viewed_at", today.toISOString());

  const viewedWordIds = new Set((viewedHistory ?? []).map((h) => h.word_id));

  return (
    <DashboardClient
      words={words ?? []}
      viewedWordIds={Array.from(viewedWordIds)}
      userId={user!.id}
    />
  );
}
