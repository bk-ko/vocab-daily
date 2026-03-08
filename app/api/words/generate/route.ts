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
    // 15개 생성 (기본 10개 함수 호출 후 부족하면 추가)
    const [batch1, batch2] = await Promise.all([
      generateWordsForLevel(level),
      generateWordsForLevel(level),
    ]);
    const generated = [...batch1, ...batch2].slice(0, 15);

    // 기존 단어 중복 제거
    const { data: existing } = await supabase
      .from("words")
      .select("word")
      .eq("level", level);

    const existingSet = new Set((existing ?? []).map((w) => w.word));
    const newWords = generated
      .filter((w) => !existingSet.has(w.word))
      .slice(0, 15)
      .map((w) => ({ ...w, level }));

    if (newWords.length === 0) {
      return NextResponse.json({ inserted: 0, message: "모든 단어가 이미 존재해요" });
    }

    const { error } = await supabase.from("words").insert(newWords);
    if (error) throw error;

    return NextResponse.json({ inserted: newWords.length });
  } catch (err) {
    console.error("단어 생성 실패:", err);
    return NextResponse.json({ error: "단어 생성에 실패했어요" }, { status: 500 });
  }
}
