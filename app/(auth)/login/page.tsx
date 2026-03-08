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
  const [showEmailForm, setShowEmailForm] = useState(false);

  async function handleAnonymous() {
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInAnonymously();
    if (error) {
      setError("시작하는 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.");
      setLoading(false);
    } else {
      router.push("/select-grade");
      router.refresh();
    }
  }

  async function handleEmailLogin(e: React.FormEvent) {
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

        <div className="bg-white rounded-2xl shadow-md p-6 space-y-3">
          {/* 메인 CTA: 바로 시작 */}
          <button
            onClick={handleAnonymous}
            disabled={loading}
            className="w-full py-4 bg-blue-500 text-white rounded-xl font-bold text-lg hover:bg-blue-600 active:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading && !showEmailForm ? "시작하는 중..." : "📖 바로 시작하기"}
          </button>
          <p className="text-center text-xs text-gray-400">이메일 없이 바로 학습할 수 있어요</p>

          <div className="flex items-center gap-3 py-1">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-300">또는</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* 이메일 로그인 */}
          {!showEmailForm ? (
            <button
              onClick={() => setShowEmailForm(true)}
              className="w-full py-3 border-2 border-gray-200 text-gray-500 rounded-xl font-medium text-sm hover:border-gray-300 hover:text-gray-700 transition-colors"
            >
              이메일로 로그인
            </button>
          ) : (
            <form onSubmit={handleEmailLogin} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:bg-white text-base transition-colors"
                placeholder="이메일"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:bg-white text-base transition-colors"
                placeholder="비밀번호"
              />
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-500 text-white rounded-xl font-semibold text-base hover:bg-blue-600 disabled:opacity-50 transition-colors"
              >
                {loading ? "로그인 중..." : "로그인"}
              </button>
              <button
                type="button"
                onClick={() => { setShowEmailForm(false); setError(""); }}
                className="w-full text-xs text-gray-400 hover:text-gray-600 py-1"
              >
                취소
              </button>
            </form>
          )}
        </div>

        {!showEmailForm && (
          <p className="text-center mt-4 text-sm text-gray-500">
            계정이 없으신가요?{" "}
            <Link href="/signup" className="text-blue-500 font-semibold hover:underline">
              회원가입
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
