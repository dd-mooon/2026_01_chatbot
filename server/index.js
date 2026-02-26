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
app.use(express.static(path.join(__dirname, 'public')));

/** Exact Match 지식 데이터 파일 경로 */
const EXACT_MATCH_FILE = path.join(__dirname, 'data', 'exact-match-knowledge.json');
/** 미답변 질문 저장 파일 경로 */
const UNANSWERED_FILE = path.join(__dirname, 'data', 'unanswered.json');

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

/** Exact Match 지식 데이터 저장 */
function saveExactMatchKnowledge(data) {
  fs.writeFileSync(EXACT_MATCH_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

/** 새 지식 ID 생성 (기존 최대 id + 1) */
function generateNewId() {
  const list = loadExactMatchKnowledge();
  const max = list.reduce((acc, item) => Math.max(acc, Number(item.id) || 0), 0);
  return String(max + 1);
}

/** 미답변 질문 목록 로드 */
function loadUnanswered() {
  try {
    const data = fs.readFileSync(UNANSWERED_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code !== 'ENOENT') console.error('미답변 목록 로드 실패:', err.message);
    return [];
  }
}

/** 미답변 질문 목록 저장 */
function saveUnanswered(data) {
  fs.writeFileSync(UNANSWERED_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

/** 미답변 질문 추가 (중복 방지: 같은 질문이 최근에 있으면 추가 안 함) */
function addUnanswered(question) {
  const list = loadUnanswered();
  const q = question.trim();
  if (!q) return;
  const recent = list.some((item) => item.question === q);
  if (recent) return;
  list.push({
    id: String(Date.now()),
    question: q,
    createdAt: new Date().toISOString(),
  });
  saveUnanswered(list);
}

/** ChromaDB에 지식 문서 추가 (RAG 검색용) */
async function addToChromaDB(id, answer, refLink = '') {
  try {
    const collection = await chromaClient.getOrCreateCollection({ name: COLLECTION_NAME });
    const chromaId = `knowledge_${id}`;
    await collection.add({
      ids: [chromaId],
      documents: [answer],
      metadatas: [{ refLink, source: 'knowledge' }],
    });
    return true;
  } catch (err) {
    console.error('ChromaDB 추가 오류:', err.message);
    return false;
  }
}

/** ChromaDB 지식 문서 수정 */
async function updateInChromaDB(id, answer, refLink = '') {
  try {
    const collection = await chromaClient.getOrCreateCollection({ name: COLLECTION_NAME });
    const chromaId = `knowledge_${id}`;
    await collection.update({
      ids: [chromaId],
      documents: [answer],
      metadatas: [{ refLink, source: 'knowledge' }],
    });
    return true;
  } catch (err) {
    console.error('ChromaDB 수정 오류:', err.message);
    return false;
  }
}

/** ChromaDB에서 지식 문서 삭제 */
async function deleteFromChromaDB(id) {
  try {
    const collection = await chromaClient.getOrCreateCollection({ name: COLLECTION_NAME });
    await collection.delete({ ids: [`knowledge_${id}`] });
    return true;
  } catch (err) {
    console.error('ChromaDB 삭제 오류:', err.message);
    return false;
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

app.get('/', (req, res) => {
  res.json({
    name: 'CHAVIS',
    message: '사내 지식 챗봇 API 서버',
    endpoints: {
      health: 'GET /health',
      chat: 'POST /api/chat (body: { question: "..." })',
      knowledge: 'GET /api/knowledge (목록), POST/PUT/DELETE /api/knowledge (CRUD)',
      unanswered: 'GET /api/unanswered (미답변 목록), DELETE /api/unanswered/:id (제거)',
    },
  });
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
      addUnanswered(trimmedQuestion);
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
      addUnanswered(trimmedQuestion);
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

// ---------- 어드민: 지식 CRUD ----------

/** GET /api/knowledge — 지식 목록 */
app.get('/api/knowledge', (req, res) => {
  try {
    const list = loadExactMatchKnowledge();
    res.json({ knowledge: list });
  } catch (err) {
    console.error('GET /api/knowledge error:', err);
    res.status(500).json({ error: '지식 목록을 불러오지 못했습니다.', detail: err.message });
  }
});

/** POST /api/knowledge — 지식 추가 (키워드, 답변, 참조 링크) */
app.post('/api/knowledge', async (req, res) => {
  try {
    const { keywords, answer, refLink } = req.body;
    if (!keywords || !Array.isArray(keywords) || keywords.length === 0 || !answer || typeof answer !== 'string') {
      return res.status(400).json({
        error: 'keywords(배열), answer(문자열)가 필요합니다.',
      });
    }

    const id = generateNewId();
    const item = { id, keywords, answer: answer.trim(), refLink: refLink?.trim() || '' };

    const list = loadExactMatchKnowledge();
    list.push(item);
    saveExactMatchKnowledge(list);

    const chromaOk = await addToChromaDB(id, item.answer, item.refLink);
    if (!chromaOk) {
      console.warn('ChromaDB 추가 실패했지만 JSON에는 저장되었습니다.');
    }

    res.status(201).json({ message: '지식이 추가되었습니다.', item });
  } catch (err) {
    console.error('POST /api/knowledge error:', err);
    res.status(500).json({ error: '지식 추가에 실패했습니다.', detail: err.message });
  }
});

/** PUT /api/knowledge/:id — 지식 수정 */
app.put('/api/knowledge/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { keywords, answer, refLink } = req.body;

    const list = loadExactMatchKnowledge();
    const index = list.findIndex((item) => item.id === id);
    if (index === -1) {
      return res.status(404).json({ error: '해당 id의 지식을 찾을 수 없습니다.' });
    }

    const prev = list[index];
    const updated = {
      id,
      keywords: Array.isArray(keywords) ? keywords : prev.keywords,
      answer: typeof answer === 'string' ? answer.trim() : prev.answer,
      refLink: refLink !== undefined ? String(refLink).trim() : prev.refLink,
    };
    list[index] = updated;
    saveExactMatchKnowledge(list);

    const chromaOk = await updateInChromaDB(id, updated.answer, updated.refLink);
    if (!chromaOk) {
      console.warn('ChromaDB 수정 실패했지만 JSON에는 반영되었습니다.');
    }

    res.json({ message: '지식이 수정되었습니다.', item: updated });
  } catch (err) {
    console.error('PUT /api/knowledge error:', err);
    res.status(500).json({ error: '지식 수정에 실패했습니다.', detail: err.message });
  }
});

/** DELETE /api/knowledge/:id — 지식 삭제 */
app.delete('/api/knowledge/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const list = loadExactMatchKnowledge();
    const index = list.findIndex((item) => item.id === id);
    if (index === -1) {
      return res.status(404).json({ error: '해당 id의 지식을 찾을 수 없습니다.' });
    }

    const [removed] = list.splice(index, 1);
    saveExactMatchKnowledge(list);

    await deleteFromChromaDB(id);

    res.json({ message: '지식이 삭제되었습니다.', item: removed });
  } catch (err) {
    console.error('DELETE /api/knowledge error:', err);
    res.status(500).json({ error: '지식 삭제에 실패했습니다.', detail: err.message });
  }
});

// ---------- 미답변 질문 (피드백 루프) ----------

/** GET /api/unanswered — 미답변 질문 목록 (어드민용) */
app.get('/api/unanswered', (req, res) => {
  try {
    const list = loadUnanswered();
    res.json({ unanswered: list });
  } catch (err) {
    console.error('GET /api/unanswered error:', err);
    res.status(500).json({ error: '미답변 목록을 불러오지 못했습니다.', detail: err.message });
  }
});

/** DELETE /api/unanswered/:id — 미답변 항목 제거 (답변 등록 후 처리 완료 시) */
app.delete('/api/unanswered/:id', (req, res) => {
  try {
    const { id } = req.params;
    const list = loadUnanswered();
    const index = list.findIndex((item) => item.id === id);
    if (index === -1) {
      return res.status(404).json({ error: '해당 id의 미답변 항목을 찾을 수 없습니다.' });
    }
    const [removed] = list.splice(index, 1);
    saveUnanswered(list);
    res.json({ message: '미답변 목록에서 제거되었습니다.', item: removed });
  } catch (err) {
    console.error('DELETE /api/unanswered error:', err);
    res.status(500).json({ error: '제거에 실패했습니다.', detail: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 CHAVIS server running at http://localhost:${PORT}`);
});