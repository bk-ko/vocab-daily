import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateWordsForGrade } from "@/lib/claude";

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

  async function processGrade(grade: number) {
    try {
      const generatedWords = await generateWordsForGrade(grade);

      const { data: existingWords } = await supabase
        .from("words")
        .select("word")
        .eq("grade", grade);

      const existingSet = new Set((existingWords ?? []).map((w) => w.word));

      const newWords = generatedWords
        .filter((w) => !existingSet.has(w.word))
        .map((w) => ({ ...w, grade }));

      if (newWords.length > 0) {
        const { error } = await supabase.from("words").insert(newWords);
        if (error) throw error;
      }

      return { inserted: newWords.length, skipped: generatedWords.length - newWords.length };
    } catch (err) {
      console.error(`Failed to generate words for grade ${grade}:`, err);
      return { inserted: 0, skipped: 0, error: String(err) };
    }
  }

  // grade 4, 7 병렬 처리
  const [result4, result7] = await Promise.all([
    processGrade(4),
    processGrade(7),
  ]);

  return NextResponse.json({
    success: true,
    results: { 4: result4, 7: result7 },
  });
}
