// index.js
import express from 'express';
import cors from 'cors';
import { ChromaClient } from 'chromadb';
import ollama from 'ollama';

const app = express();
const PORT = process.env.PORT || 3001;

// ChromaDB 클라이언트 (서버 실행 시 한 번만 생성)
const chromaClient = new ChromaClient();
const COLLECTION_NAME = 'company_knowledge';
const RAG_TOP_K = 5;
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3';

app.use(cors());
app.use(express.json());

/** ChromaDB에서 질문과 유사한 사내 지식 검색 */
async function searchKnowledge(question) {
  const collection = await chromaClient.getOrCreateCollection({
    name: COLLECTION_NAME,
  });
  const result = await collection.query({
    queryTexts: [question],
    nResults: RAG_TOP_K,
  });
  // result.documents[0] = 첫 번째 쿼리에 대한 문서 배열 (string | null)[]
  const docs = (result.documents && result.documents[0]) || [];
  const metadatas = (result.metadatas && result.metadatas[0]) || [];
  return docs
    .filter((d) => d != null && d.trim() !== '')
    .map((doc, i) => ({
      text: doc,
      metadata: metadatas[i] || {},
    }));
}

/** Ollama로 컨텍스트 + 질문 기반 답변 생성 */
async function getAnswerFromOllama(contextText, question) {
  const prompt = `당신은 사내 지식 가이드 챗봇(CHAVIS)입니다. 아래 [사내 지식]만을 참고하여 질문에 친절하고 정확하게 답변하세요. 참고 자료에 없는 내용은 "해당 정보는 등록되어 있지 않습니다. 인사/총무에 문의해 주세요."라고 답하세요.

[사내 지식]
${contextText}

[질문]
${question}`;

  const response = await ollama.chat({
    model: OLLAMA_MODEL,
    messages: [{ role: 'user', content: prompt }],
  });
  return response.message?.content ?? '';
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'CHAVIS server is running' });
});

/** 챗봇 질문 → RAG 검색 + Ollama 답변 */
app.post('/api/chat', async (req, res) => {
  try {
    const { question } = req.body;
    if (!question || typeof question !== 'string') {
      return res.status(400).json({
        error: 'question 필드(문자열)가 필요합니다.',
      });
    }

    const sources = await searchKnowledge(question.trim());
    const contextText =
      sources.length > 0
        ? sources.map((s) => s.text).join('\n\n')
        : '(등록된 사내 지식이 없습니다.)';

    const answer = await getAnswerFromOllama(contextText, question.trim());

    res.json({
      answer,
      sources: sources.map((s) => ({ text: s.text, metadata: s.metadata })),
    });
  } catch (err) {
    console.error('/api/chat error:', err);
    res.status(500).json({
      error: '답변 생성 중 오류가 발생했습니다.',
      detail: err.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 CHAVIS server running at http://localhost:${PORT}`);
});