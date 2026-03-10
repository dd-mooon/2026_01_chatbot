/**
 * 코니 API 서버 - 리팩토링 버전
 */
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import { PORT, UPLOADS_DIR } from './config.js';
import chatRouter from './routes/chat.js';
import knowledgeRouter from './routes/knowledge.js';
import uploadRouter from './routes/upload.js';
import unansweredRouter from './routes/unanswered.js';
import ollamaRouter from './routes/ollama.js';
import { loadFaqIds, saveFaqIds, getFaqChips } from './services/faq.js';
import { FAQ_MAX } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(UPLOADS_DIR));

app.get('/health', (req, res) => res.json({ status: 'ok', message: 'Connie server is running' }));

app.get('/', (req, res) => {
  res.json({
    name: 'Connie',
    message: '사내 지식 챗봇 API 서버',
    endpoints: {
      health: 'GET /health',
      chat: 'POST /api/chat (body: { question: "..." })',
      knowledge: 'GET /api/knowledge (목록), POST/PUT/DELETE /api/knowledge (CRUD)',
      unanswered: 'GET /api/unanswered (미답변 목록), DELETE /api/unanswered/:id (제거)',
    },
    admin: 'GET /admin.html (지식·미답변 관리 — 여기서 넣은 데이터가 챗봇에서 사용됨)',
  });
});

app.use('/api/chat', chatRouter);
app.use('/api/ollama-status', ollamaRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/knowledge', knowledgeRouter);
app.use('/api/unanswered', unansweredRouter);

app.get('/api/faq', (req, res) => {
  try {
    const ids = loadFaqIds();
    const chips = getFaqChips();
    res.json({ ids, chips, max: FAQ_MAX });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.put('/api/faq', (req, res) => {
  try {
    const { ids } = req.body || {};
    const arr = Array.isArray(ids) ? ids : [];
    if (arr.length > FAQ_MAX) {
      return res.status(400).json({ error: `최대 ${FAQ_MAX}개까지 선택 가능합니다.` });
    }
    saveFaqIds(arr);
    const chips = getFaqChips();
    res.json({ message: '저장되었습니다.', ids: arr, chips });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use('/api', (req, res) => {
  res.status(404).json({ error: '해당 API를 찾을 수 없습니다.', path: req.path });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    error: err.message || '서버 오류가 발생했습니다.',
    detail: err.stack ? undefined : err.message,
  });
});

const server = app.listen(PORT, () => {
  console.log(`🚀 Connie server running at http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ 포트 ${PORT}이(가) 이미 사용 중입니다. 기존 프로세스를 종료하세요: lsof -i :${PORT}`);
  } else {
    console.error('서버 시작 오류:', err);
  }
  process.exit(1);
});

process.stdin.resume();
