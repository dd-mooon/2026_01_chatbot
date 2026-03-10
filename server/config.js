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

export const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3:latest';
export const OLLAMA_TIMEOUT_MS = Number(process.env.OLLAMA_TIMEOUT_MS) || 120000;
export const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';

export const COLLECTION_NAME = 'company_knowledge';
export const RAG_TOP_K = 5;

export const FALLBACK_NO_KNOWLEDGE = '해당 정보는 등록되어 있지 않습니다. 인사/총무에 문의해 주세요.';
export const GENERAL_KNOWLEDGE_DISCLAIMER = '※ 이 답변은 등록된 사내 지식이 아닌 AI의 일반 지식입니다. 정확한 정보는 인사/총무에 문의해 주세요.';
