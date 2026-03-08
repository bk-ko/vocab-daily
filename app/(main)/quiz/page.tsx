import { createServerClient } from "@/lib/supabase/server";
import QuizClient from "./QuizClient";

export default async function QuizPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const { mode } = await searchParams;
  const isReview = mode === "review";

  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const level = Number(user!.user_metadata?.level ?? 2);

  let quizWordIds: string[] = [];

  if (isReview) {
    // 복습 모드: 역대 quiz_result = false 단어 (passed 제외)
    const { data: unknownHistory } = await supabase
      .from("user_word_history")
      .select("word_id")
      .eq("user_id", user!.id)
      .eq("quiz_result", false)
      .eq("passed", false)
      .order("viewed_at", { ascending: false })
      .limit(20);
    quizWordIds = (unknownHistory ?? []).map((h) => h.word_id);
  } else {
    // 오늘 모드: 오늘 열람한 단어
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { data: viewedHistory } = await supabase
      .from("user_word_history")
      .select("word_id")
      .eq("user_id", user!.id)
      .gte("viewed_at", today.toISOString());
    quizWordIds = (viewedHistory ?? []).map((h) => h.word_id);
  }

  if (quizWordIds.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-4xl mb-3">{isReview ? "🎉" : "📖"}</p>
        <p className="font-medium text-gray-600">
          {isReview ? "모르는 단어가 없어요! 다 외웠군요 👏" : "먼저 오늘의 단어를 확인해 주세요!"}
        </p>
        {!isReview && <p className="text-sm mt-1">단어를 탭해서 뜻을 확인한 후 퀴즈를 풀 수 있어요</p>}
      </div>
    );
  }

  const { data: words } = await supabase
    .from("words")
    .select("*")
    .in("id", quizWordIds);

  // distractor pool: 같은 레벨 다른 단어들 + 다른 레벨도 섞어서 충분히 확보
  const { data: allWords } = await supabase
    .from("words")
    .select("id, definition")
    .not("id", "in", `(${quizWordIds.join(",")})`)
    .limit(50);

  return (
    <QuizClient
      words={words ?? []}
      distractors={(allWords ?? []).map((w) => w.definition)}
      userId={user!.id}
      mode={isReview ? "review" : "today"}
    />
  );
}
