"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const GRADES = [
  { value: "초4", label: "초등 4학년" },
  { value: "중1", label: "중학교 1학년" },
];

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("초4");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { grade, name },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">📚</div>
          <h1 className="text-3xl font-bold text-blue-600">단어장</h1>
          <p className="text-gray-500 mt-1 text-sm">회원가입하고 학습을 시작해요!</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:bg-white text-base transition-colors"
              placeholder="이름 입력"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">학년</label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:border-blue-400 focus:bg-white text-base transition-colors"
            >
              {GRADES.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>

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
              minLength={6}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:bg-white text-base transition-colors"
              placeholder="6자 이상"
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
            {loading ? "가입 중..." : "회원가입"}
          </button>
        </form>

        <p className="text-center mt-4 text-sm text-gray-500">
          이미 계정이 있으신가요?{" "}
          <Link href="/login" className="text-blue-500 font-semibold hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
