import { createServerClient } from "@/lib/supabase/server";
import ManageClient from "./ManageClient";

export default async function ManagePage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("grade")
    .eq("id", user!.id)
    .single();

  const grade = profile?.grade ?? 3;

  const { data: words } = await supabase
    .from("words")
    .select("*")
    .eq("grade", grade)
    .order("created_at", { ascending: false });

  return <ManageClient words={words ?? []} grade={grade} />;
}
