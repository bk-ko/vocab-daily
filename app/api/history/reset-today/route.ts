import { createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function DELETE() {
  // 사용자 인증 확인 (쿠키 기반)
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 삭제는 service role로 RLS 우회
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 한국 시간 기준 오늘 자정 (KST = UTC+9)
  const now = new Date();
  const kstOffset = 9 * 60 * 60 * 1000;
  const kstNow = new Date(now.getTime() + kstOffset);
  const kstMidnight = new Date(Date.UTC(
    kstNow.getUTCFullYear(),
    kstNow.getUTCMonth(),
    kstNow.getUTCDate(),
  ));
  // KST 자정을 UTC로 변환
  const todayUTC = new Date(kstMidnight.getTime() - kstOffset);

  const { error, count } = await admin
    .from("user_word_history")
    .delete({ count: "exact" })
    .eq("user_id", user.id)
    .gte("viewed_at", todayUTC.toISOString());

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ deleted: count });
}
