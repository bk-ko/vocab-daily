import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateWordsForGrade } from "@/lib/claude";

export async function GET(request: NextRequest) {
  // Verify cron secret to prevent unauthorized calls
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const results: Record<number, { inserted: number; skipped: number }> = {};

  for (const grade of [3, 4, 5, 6]) {
    try {
      const generatedWords = await generateWordsForGrade(grade);

      // Get existing words for this grade to check duplicates
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

      results[grade] = {
        inserted: newWords.length,
        skipped: generatedWords.length - newWords.length,
      };
    } catch (err) {
      console.error(`Failed to generate words for grade ${grade}:`, err);
      results[grade] = { inserted: 0, skipped: 0 };
    }
  }

  return NextResponse.json({ success: true, results });
}
