import { createServerClient } from "@/lib/supabase/server";
import ManageClient from "./ManageClient";

export default async function ManagePage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const gradeLabel = user!.user_metadata?.grade as string | undefined;
  const grade = gradeLabel === "중1" ? 7 : 4;

  const { data: words } = await supabase
    .from("words")
    .select("*")
    .eq("grade", grade)
    .order("created_at", { ascending: false });

  return <ManageClient words={words ?? []} grade={grade} />;
}
