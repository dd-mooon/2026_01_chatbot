/**
 * 코니 API 서버 - 리팩토링 버전
 * 정적 파일보다 API 라우트를 먼저 등록해 /api/* 가 항상 라우터로 처리됩니다.
 */
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

import { PORT, UPLOADS_DIR, chromaConnection, CORS_ALLOWED_ORIGINS } from './config.js';
import chatRouter from './routes/chat.js';
import knowledgeRouter from './routes/knowledge.js';
import uploadRouter from './routes/upload.js';
import unansweredRouter from './routes/unanswered.js';
import ollamaRouter from './routes/ollama.js';
import authRouter from './routes/auth.js';
import faqRouter from './routes/faq.js';
import { requireAdminAuth } from './middleware/requireAdminAuth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }
      if (CORS_ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
        return;
      }
      console.warn('CORS 차단:', origin);
      callback(null, false);
    },
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
      faq: 'GET /api/faq, PUT /api/faq (관리자)',
    },
    admin: 'GET /admin.html (로그인 후 지식·미답변 관리)',
    auth:
      'POST /api/auth/register|login|logout, GET /api/auth/me, GET /api/auth/pending-registrations, POST approve|reject-registration',
  });
});

app.use('/api/auth', authRouter);

app.use('/api/chat', chatRouter);
app.use('/api/ollama-status', ollamaRouter);
app.use('/api/upload', requireAdminAuth, uploadRouter);
app.use('/api/knowledge', requireAdminAuth, knowledgeRouter);
app.use('/api/unanswered', requireAdminAuth, unansweredRouter);
app.use('/api/faq', faqRouter);

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(UPLOADS_DIR));

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

const server = app.listen(PORT);

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ 포트 ${PORT}이(가) 이미 사용 중입니다. 아래로 종료 후 다시 실행하세요.`);
    console.error(`   kill $(lsof -t -i:${PORT})`);
  } else {
    console.error('서버 시작 오류:', err);
  }
  process.exit(1);
});

server.on('listening', () => {
  const chromaUrl = `${chromaConnection.ssl ? 'https' : 'http'}://${chromaConnection.host}:${chromaConnection.port}`;
  console.log(`🚀 Connie server running at http://localhost:${PORT}`);
  console.log(`📦 ChromaDB → ${chromaUrl}`);
});

process.stdin.resume();
