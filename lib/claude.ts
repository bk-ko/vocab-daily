import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface GeneratedWord {
  word: string;
  definition: string;
  example: string;
}

const GRADE_LABELS: Record<number, string> = {
  3: "초등학교 3학년",
  4: "초등학교 4학년",
  5: "초등학교 5학년",
  6: "초등학교 6학년",
};

export async function generateWordsForGrade(grade: number): Promise<GeneratedWord[]> {
  const gradeLabel = GRADE_LABELS[grade] ?? "초등학교 3학년";

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `${gradeLabel} 수준의 초등학생이 배워야 할 영어 단어 10개를 JSON 배열로 생성해줘.
각 항목 형식: { "word": "영어단어", "definition": "한국어 뜻 (한두 문장)", "example": "영어 예문 (한국어 해석 포함)" }
조건:
- 중복 없이
- 일상생활에서 자주 쓰이는 영단어
- 학년 수준에 맞는 난이도
- 뜻은 한국어로 쉽게 설명
- 예문은 "I have a dog. (나는 개를 키운다.)" 형식으로
반드시 순수 JSON 배열만 출력하고 다른 텍스트는 포함하지 마.`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude");
  }

  // Extract JSON array from response
  const text = content.text.trim();
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error("Could not find JSON array in response");
  }

  const words: GeneratedWord[] = JSON.parse(jsonMatch[0]);
  return words;
}
