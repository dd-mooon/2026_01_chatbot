/**
 * 앱 상수
 */
export const API_BASE = import.meta.env.VITE_API_URL || '';

/**
 * 서버가 주는 `/uploads/...` 등 상대 경로를 배포 환경에서 API 호스트(Render) 기준 절대 URL로 변환.
 * 로컬(Vite)에서는 API_BASE가 비어 있으면 상대 경로 유지 → proxy가 `/uploads`를 백엔드로 넘김.
 */
export function resolveServerUrl(pathOrUrl) {
  if (pathOrUrl == null || typeof pathOrUrl !== 'string') return '';
  const s = pathOrUrl.trim();
  if (!s) return '';
  if (/^https?:\/\//i.test(s)) return s;
  const base = API_BASE.replace(/\/$/, '');
  if (!base) return s.startsWith('/') ? s : `/${s}`;
  return s.startsWith('/') ? `${base}${s}` : `${base}/${s}`;
}

/** `public/` 정적 아바타 등 교체 시 CDN·브라우저 캐시 무력화용(값만 올리면 됨) */
export const PUBLIC_ASSET_VER = '3';
export const COMPANY_SITE = 'https://kr.catalyst.concentrix.com/';

export const FAQ_CHIPS = ['건전지 어디 있어?', '회식 언제야?', '연차는 며칠이야?'];

export const ANSWER_SOURCE_LABEL = {
  exact_match: '📋 어드민에 등록된 지식에서 찾은 답변',
  rag: '🤖 등록된 지식을 참고해 AI(Ollama)가 생성한 답변',
  no_match: '🤖 등록된 정보가 없어 AI(Ollama)가 안내한 메시지',
  no_match_general: '🤖 AI가 일반 지식으로 답변 (등록된 사내 지식 아님)',
};
