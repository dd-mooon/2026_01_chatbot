// index.js
import express from 'express';
import cors from 'cors';
import { ChromaClient } from 'chromadb';
import ollama from 'ollama';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// ChromaDB 클라이언트 (서버 실행 시 한 번만 생성)
const chromaClient = new ChromaClient();
const COLLECTION_NAME = 'company_knowledge';
const RAG_TOP_K = 5;
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3';

app.use(cors());
app.use(express.json());

/** Exact Match 지식 데이터 파일 경로 */
const EXACT_MATCH_FILE = path.join(__dirname, 'data', 'exact-match-knowledge.json');

/** Exact Match 지식 데이터 로드 */
function loadExactMatchKnowledge() {
  try {
    const data = fs.readFileSync(EXACT_MATCH_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Exact Match 지식 데이터 로드 실패:', err.message);
    return [];
  }
}

/** Exact Match 검색: 질문에 키워드가 정확히 일치하는 답변 찾기 */
function findExactMatch(question) {
  const knowledge = loadExactMatchKnowledge();
  const questionLower = question.toLowerCase().trim();

  for (const item of knowledge) {
    // 키워드 배열에서 하나라도 질문에 포함되면 매치
    const matchedKeyword = item.keywords.find((keyword) =>
      questionLower.includes(keyword.toLowerCase())
    );

    if (matchedKeyword) {
      return {
        answer: item.answer,
        refLink: item.refLink,
        matchedKeyword: matchedKeyword,
        type: 'exact_match',
      };
    }
  }

  return null;
}

/** ChromaDB에서 질문과 유사한 사내 지식 검색 */
async function searchKnowledge(question) {
  try {
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
  } catch (err) {
    console.error('ChromaDB 검색 오류:', err.message);
    // ChromaDB 연결 실패 시 빈 배열 반환 (Exact Match만 사용)
    return [];
  }
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

/** 챗봇 질문 → Exact Match 우선 검사 → 없으면 RAG 검색 + Ollama 답변 */
app.post('/api/chat', async (req, res) => {
  try {
    const { question } = req.body;
    if (!question || typeof question !== 'string') {
      return res.status(400).json({
        error: 'question 필드(문자열)가 필요합니다.',
      });
    }

    const trimmedQuestion = question.trim();

    // 1. Exact Match 먼저 검사
    const exactMatch = findExactMatch(trimmedQuestion);
    if (exactMatch) {
      return res.json({
        answer: exactMatch.answer,
        refLink: exactMatch.refLink,
        type: 'exact_match',
        matchedKeyword: exactMatch.matchedKeyword,
        sources: [],
      });
    }

    // 2. Exact Match가 없으면 RAG 검색
    const sources = await searchKnowledge(trimmedQuestion);
    
    // ChromaDB에 데이터가 없거나 연결 실패 시
    if (sources.length === 0) {
      return res.json({
        answer: '해당 정보는 등록되어 있지 않습니다. 인사/총무에 문의해 주세요.',
        type: 'no_match',
        sources: [],
      });
    }

    const contextText = sources.map((s) => s.text).join('\n\n');
    
    try {
      const answer = await getAnswerFromOllama(contextText, trimmedQuestion);
      res.json({
        answer,
        type: 'rag',
        sources: sources.map((s) => ({ text: s.text, metadata: s.metadata })),
      });
    } catch (ollamaErr) {
      console.error('Ollama 오류:', ollamaErr.message);
      res.status(500).json({
        error: '답변 생성 중 오류가 발생했습니다.',
        detail: 'Ollama 서비스가 실행 중인지 확인해주세요.',
      });
    }
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