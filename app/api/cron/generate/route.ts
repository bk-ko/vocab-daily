import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateWordsForLevel } from "@/lib/claude";

export const maxDuration = 60; // Vercel 최대 60초 허용

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  async function processLevel(level: number) {
    try {
      const generatedWords = await generateWordsForLevel(level);

      const { data: existingWords } = await supabase
        .from("words")
        .select("word")
        .eq("level", level);

      const existingSet = new Set((existingWords ?? []).map((w) => w.word));

      const newWords = generatedWords
        .filter((w) => !existingSet.has(w.word))
        .map((w) => ({ ...w, level }));

      if (newWords.length > 0) {
        const { error } = await supabase.from("words").insert(newWords);
        if (error) throw error;
      }

      return { inserted: newWords.length, skipped: generatedWords.length - newWords.length };
    } catch (err) {
      console.error(`Failed to generate words for level ${level}:`, err);
      return { inserted: 0, skipped: 0, error: String(err) };
    }
  }

  // level 1~4 병렬 처리
  const [result1, result2, result3, result4] = await Promise.all([
    processLevel(1),
    processLevel(2),
    processLevel(3),
    processLevel(4),
  ]);

  return NextResponse.json({
    success: true,
    results: { 1: result1, 2: result2, 3: result3, 4: result4 },
  });
}
