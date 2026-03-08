import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { generateWordsForLevel } from "@/lib/claude";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  // 유저 인증 확인
  const supabaseUser = await createServerClient();
  const { data: { user } } = await supabaseUser.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const level = Number(user.user_metadata?.level ?? 2);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // 20개 생성 (2배치 병렬) → 중복 제거 후 최대 15개 삽입
    const [batch1, batch2] = await Promise.all([
      generateWordsForLevel(level),
      generateWordsForLevel(level),
    ]);

    // 배치 내부 중복 제거 (단어 기준)
    const seen = new Set<string>();
    const generated = [...batch1, ...batch2].filter((w) => {
      if (seen.has(w.word.toLowerCase())) return false;
      seen.add(w.word.toLowerCase());
      return true;
    });

    // DB 기존 단어와 중복 제거
    const { data: existing } = await supabase
      .from("words")
      .select("word")
      .eq("level", level);

    const existingSet = new Set((existing ?? []).map((w) => w.word.toLowerCase()));
    const newWords = generated
      .filter((w) => !existingSet.has(w.word.toLowerCase()))
      .slice(0, 15)
      .map((w) => ({ ...w, level }));

    if (newWords.length === 0) {
      return NextResponse.json({ inserted: 0, message: "모든 단어가 이미 존재해요" });
    }

    const { data: inserted, error } = await supabase
      .from("words")
      .insert(newWords)
      .select("id, word, definition, example, level");
    if (error) throw error;

    return NextResponse.json({ inserted: inserted?.length ?? 0, words: inserted });
  } catch (err) {
    console.error("단어 생성 실패:", err);
    return NextResponse.json({ error: "단어 생성에 실패했어요" }, { status: 500 });
  }
}
