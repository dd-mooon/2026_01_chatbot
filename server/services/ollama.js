/**
 * LLM 연동 — GROQ_API_KEY가 있으면 Groq, 없으면 로컬 Ollama
 */
import { Ollama } from 'ollama';
import {
  OLLAMA_MODEL,
  OLLAMA_TIMEOUT_MS,
  OLLAMA_HOST,
  GROQ_MODEL,
  USE_GROQ,
  FALLBACK_NO_KNOWLEDGE,
  GENERAL_KNOWLEDGE_DISCLAIMER,
} from '../config.js';

const GROQ_CHAT_URL = 'https://api.groq.com/openai/v1/chat/completions';

const ollama = new Ollama({ host: OLLAMA_HOST });

function withTimeout(promise, ms, label = 'LLM') {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(
        () =>
          reject(
            new Error(
              `${label} 응답 시간 초과(${ms / 1000}초). ${USE_GROQ ? 'Groq 상태를 확인하세요.' : 'Ollama가 실행 중인지, 모델이 로드되었는지 확인하세요.'}`
            )
          ),
        ms
      )
    ),
  ]);
}

/**
 * Groq OpenAI 호환 chat.completions — ollama.chat 과 동일한 형태로 반환
 */
async function groqChat({ model, messages }) {
  const key = process.env.GROQ_API_KEY?.trim();
  if (!key) throw new Error('GROQ_API_KEY가 없습니다.');

  const res = await fetch(GROQ_CHAT_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model || GROQ_MODEL,
      messages,
      temperature: 0.5,
    }),
  });

  const raw = await res.text();
  if (!res.ok) {
    throw new Error(`Groq API ${res.status}: ${raw.slice(0, 400)}`);
  }
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error(`Groq 응답 파싱 실패: ${raw.slice(0, 200)}`);
  }
  const content = data.choices?.[0]?.message?.content ?? '';
  return { message: { content } };
}

async function chatLlm(params) {
  if (USE_GROQ) {
    return groqChat({ model: GROQ_MODEL, messages: params.messages });
  }
  return ollama.chat({ model: params.model ?? OLLAMA_MODEL, messages: params.messages });
}

export async function getAnswerFromOllama(contextText, question) {
  const prompt = `당신은 사내 지식 가이드 챗봇(Connie)입니다. 아래 [사내 지식]만을 참고하여 질문에 친절하고 정확하게 답변하세요. 참고 자료에 없는 내용은 "해당 정보는 등록되어 있지 않습니다. 인사/총무에 문의해 주세요."라고 답하세요.

[사내 지식]
${contextText}

[질문]
${question}`;

  const response = await withTimeout(
    chatLlm({ messages: [{ role: 'user', content: prompt }] }),
    OLLAMA_TIMEOUT_MS,
    USE_GROQ ? 'Groq(RAG)' : 'Ollama(RAG)'
  );
  return response.message?.content ?? '';
}

export async function getGeneralKnowledgeReplyFromOllama(question) {
  const prompt = `당신은 친절한 안내 챗봇입니다. 아래 질문에 대해 알고 있는 일반 지식 범위에서 간단하고 도움이 되게 한국어로 답변해 주세요. 모르는 내용이면 "해당 정보는 잘 모르겠습니다. 인사/총무에 문의해 주세요."라고만 답하세요.`;

  const response = await withTimeout(
    chatLlm({
      messages: [{ role: 'user', content: `${prompt}\n\n[질문]\n${question}` }],
    }),
    OLLAMA_TIMEOUT_MS,
    USE_GROQ ? 'Groq(일반지식)' : 'Ollama(일반지식)'
  );
  const text = (response.message?.content ?? '').trim();
  return text || FALLBACK_NO_KNOWLEDGE;
}

export { ollama, OLLAMA_MODEL, FALLBACK_NO_KNOWLEDGE, GENERAL_KNOWLEDGE_DISCLAIMER };
