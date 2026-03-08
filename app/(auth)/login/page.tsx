"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("이메일 또는 비밀번호가 잘못되었습니다.");
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">📚</div>
          <h1 className="text-3xl font-bold text-blue-600">단어장</h1>
          <p className="text-gray-500 mt-1 text-sm">매일 새로운 단어를 배워요!</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:bg-white text-base transition-colors"
              placeholder="example@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:bg-white text-base transition-colors"
              placeholder="비밀번호 입력"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-500 text-white rounded-xl font-semibold text-base hover:bg-blue-600 active:bg-blue-700 disabled:opacity-50 transition-colors mt-2"
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <p className="text-center mt-4 text-sm text-gray-500">
          계정이 없으신가요?{" "}
          <Link href="/signup" className="text-blue-500 font-semibold hover:underline">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}
