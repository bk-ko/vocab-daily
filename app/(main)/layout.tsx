import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";

const LEVEL_LABELS: Record<number, string> = {
  1: "Lv.1 기초",
  2: "Lv.2 심화",
  3: "Lv.3 중급",
  4: "Lv.4 고급",
};

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const level = user.user_metadata?.level as number | undefined;
  const levelLabel = level ? LEVEL_LABELS[level] : undefined;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="text-xl font-bold text-blue-600">
            📚 단어장
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/select-grade" className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-500 transition-colors">
              <span>{user.email?.split("@")[0]}</span>
              <span className="bg-blue-100 text-blue-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                {levelLabel ?? "레벨선택"}
              </span>
              <span className="text-xs">✏️</span>
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6">
        {children}
      </main>

      {/* Bottom nav */}
      <nav className="bg-white border-t border-gray-100 sticky bottom-0">
        <div className="max-w-lg mx-auto flex">
          {[
            { href: "/dashboard", icon: "🏠", label: "오늘의 단어" },
            { href: "/history", icon: "📋", label: "학습 이력" },
            { href: "/manage", icon: "⚙️", label: "단어 관리" },
          ].map(({ href, icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center py-3 text-gray-500 hover:text-blue-500 transition-colors"
            >
              <span className="text-xl">{icon}</span>
              <span className="text-xs mt-0.5">{label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
