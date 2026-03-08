import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface GeneratedWord {
  word: string;
  definition: string;
  example: string;
}

const LEVEL_PROMPTS: Record<number, string> = {
  1: `초등학교 3-4학년 교육부 기본어휘 수준의 아주 쉬운 일상 영어 단어 10개를 JSON 배열로 생성해줘.
각 항목 형식: { "word": "영어단어", "definition": "한국어 뜻 (한두 문장)", "example": "영어 예문 (한국어 해석 포함)" }
조건:
- 중복 없이
- cat, run, happy 수준의 아주 쉬운 단어
- 일상생활에서 자주 쓰이는 기초 영단어
- 뜻은 한국어로 쉽게 설명
- 예문은 "I have a dog. (나는 개를 키운다.)" 형식으로
반드시 순수 JSON 배열만 출력하고 다른 텍스트는 포함하지 마.`,

  2: `초등학교 5-6학년 교육부 기본어휘 수준의 중간 난이도 영어 단어 10개를 JSON 배열로 생성해줘.
각 항목 형식: { "word": "영어단어", "definition": "한국어 뜻 (한두 문장)", "example": "영어 예문 (한국어 해석 포함)" }
조건:
- 중복 없이
- homework, library, friendly 수준의 단어
- 학교생활과 일상에서 쓰이는 단어
- 뜻은 한국어로 쉽게 설명
- 예문은 "I have a dog. (나는 개를 키운다.)" 형식으로
반드시 순수 JSON 배열만 출력하고 다른 텍스트는 포함하지 마.`,

  3: `중학교 1-2학년 교육부 기본어휘 수준의 다소 어려운 영어 단어 10개를 JSON 배열로 생성해줘.
각 항목 형식: { "word": "영어단어", "definition": "한국어 뜻 (한두 문장)", "example": "영어 예문 (한국어 해석 포함)" }
조건:
- 중복 없이
- atmosphere, contrast, describe 수준의 단어
- 초등보다 난이도 높게, 일상/학교생활 관련 단어
- 뜻은 한국어로 쉽게 설명
- 예문은 "I have a dog. (나는 개를 키운다.)" 형식으로
반드시 순수 JSON 배열만 출력하고 다른 텍스트는 포함하지 마.`,

  4: `중학교 3학년~고등학교 1학년 수준의 어려운 영어 단어 10개를 JSON 배열로 생성해줘.
각 항목 형식: { "word": "영어단어", "definition": "한국어 뜻 (한두 문장)", "example": "영어 예문 (한국어 해석 포함)" }
조건:
- 중복 없이
- negotiate, efficient, perspective 수준의 단어
- 학술적이고 실용적인 고급 단어
- 뜻은 한국어로 쉽게 설명
- 예문은 "I have a dog. (나는 개를 키운다.)" 형식으로
반드시 순수 JSON 배열만 출력하고 다른 텍스트는 포함하지 마.`,
};

export async function generateWordsForLevel(level: number): Promise<GeneratedWord[]> {
  const prompt = LEVEL_PROMPTS[level] ?? LEVEL_PROMPTS[2];

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude");
  }

  // Extract JSON array from response (마크다운 코드블록 포함 처리)
  const text = content.text.trim();

  // 마크다운 ```json ... ``` 블록 먼저 시도
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const searchText = codeBlockMatch ? codeBlockMatch[1] : text;

  const jsonMatch = searchText.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error("Could not find JSON array in response");
  }

  const words: GeneratedWord[] = JSON.parse(jsonMatch[0]);
  return words;
}
