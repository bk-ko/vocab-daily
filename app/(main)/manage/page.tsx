import { createServerClient } from "@/lib/supabase/server";
import ManageClient from "./ManageClient";

export default async function ManagePage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const level = Number(user!.user_metadata?.level ?? 2);

  const { data: words } = await supabase
    .from("words")
    .select("*")
    .eq("level", level)
    .order("created_at", { ascending: false });

  return <ManageClient words={words ?? []} level={level} />;
}
