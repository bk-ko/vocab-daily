import { createServerClient } from "@/lib/supabase/server";
import QuizClient from "./QuizClient";

export default async function QuizPage() {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const level = Number(user!.user_metadata?.level ?? 2);

  // Get today's viewed words
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data: viewedHistory } = await supabase
    .from("user_word_history")
    .select("word_id")
    .eq("user_id", user!.id)
    .gte("viewed_at", today.toISOString());

  const viewedWordIds = (viewedHistory ?? []).map((h) => h.word_id);

  if (viewedWordIds.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-4xl mb-3">📖</p>
        <p className="font-medium text-gray-600">먼저 오늘의 단어를 확인해 주세요!</p>
        <p className="text-sm mt-1">단어를 탭해서 뜻을 확인한 후 퀴즈를 풀 수 있어요</p>
      </div>
    );
  }

  // Get word details for viewed words
  const { data: words } = await supabase
    .from("words")
    .select("*")
    .in("id", viewedWordIds);

  // Get all words for the level (for wrong answer options)
  const { data: allWords } = await supabase
    .from("words")
    .select("id, definition")
    .eq("level", level)
    .not("id", "in", `(${viewedWordIds.join(",")})`)
    .limit(30);

  return (
    <QuizClient
      words={words ?? []}
      distractors={(allWords ?? []).map((w) => w.definition)}
      userId={user!.id}
    />
  );
}
