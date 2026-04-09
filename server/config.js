/**
 * 서버 설정
 */
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const PORT = process.env.PORT || 3001;
export const UPLOADS_DIR = path.join(__dirname, 'uploads');
export const EXACT_MATCH_FILE = path.join(__dirname, 'data', 'exact-match-knowledge.json');
export const UNANSWERED_FILE = path.join(__dirname, 'data', 'unanswered.json');
export const FAQ_FILE = path.join(__dirname, 'data', 'faq.json');
export const ADMIN_USERS_FILE = path.join(__dirname, 'data', 'admin-users.json');
export const FAQ_MAX = 3;

/** 관리자 로그인 허용 이메일 도메인 */
export const ADMIN_EMAIL_DOMAIN = 'concentrix.com';

/**
 * CORS 허용 Origin
 * - ALLOWED_ORIGINS: 쉼표로 여러 개 (Render·로컬 .env)
 * - production: Vercel 프론트 기본값 병합
 * - 그 외: Vite dev/preview 로컬 기본값 병합
 */
function buildCorsAllowedOrigins() {
  const fromEnv = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const devDefaults = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:4173',
    'http://127.0.0.1:4173',
  ];
  const prodDefaults = ['https://2026-01-chatbot.vercel.app'];
  const isProd = process.env.NODE_ENV === 'production';
  const defaults = isProd ? prodDefaults : devDefaults;
  return [...new Set([...fromEnv, ...defaults])];
}

export const CORS_ALLOWED_ORIGINS = buildCorsAllowedOrigins();

export const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3:latest';
export const OLLAMA_TIMEOUT_MS = Number(process.env.OLLAMA_TIMEOUT_MS) || 120000;
export const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';

/** Groq OpenAI 호환 API (GROQ_API_KEY가 있으면 Ollama 대신 사용) */
export const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
export const USE_GROQ = Boolean(process.env.GROQ_API_KEY?.trim());

export const COLLECTION_NAME = 'company_knowledge';
export const RAG_TOP_K = 5;

/**
 * ChromaDB 서버 주소 (배포 시 CHROMA_URL 또는 CHROMA_HOST 등으로 지정)
 * - CHROMA_URL 이 있으면 최우선 (예: http://chromadb:8000, https://xxx.chroma.cloud)
 * - 없으면 CHROMA_HOST + CHROMA_PORT + CHROMA_SSL (기본 localhost:8000)
 */
function getChromaConnection() {
  const raw = process.env.CHROMA_URL?.trim();
  if (raw) {
    try {
      const u = new URL(raw);
      const port = u.port ? Number(u.port) : 8000;
      return {
        host: u.hostname,
        port,
        ssl: u.protocol === 'https:',
      };
    } catch (e) {
      console.warn('CHROMA_URL 파싱 실패, CHROMA_HOST 기본값 사용:', e.message);
    }
  }
  return {
    host: process.env.CHROMA_HOST || 'localhost',
    port: Number(process.env.CHROMA_PORT) || 8000,
    ssl: process.env.CHROMA_SSL === 'true' || process.env.CHROMA_SSL === '1',
  };
}

export const chromaConnection = getChromaConnection();

/** Chroma Cloud 등 토큰 인증이 필요할 때 */
export const CHROMA_API_TOKEN = process.env.CHROMA_API_TOKEN?.trim() || '';

export const FALLBACK_NO_KNOWLEDGE = '해당 정보는 등록되어 있지 않습니다. 인사/총무에 문의해 주세요.';
export const GENERAL_KNOWLEDGE_DISCLAIMER = '※ 이 답변은 등록된 사내 지식이 아닌 AI의 일반 지식입니다. 정확한 정보는 인사/총무에 문의해 주세요.';
