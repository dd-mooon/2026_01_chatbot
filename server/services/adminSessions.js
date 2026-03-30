/**
 * 관리자 세션 (메모리 저장, 서버 재시작 시 로그아웃됨)
 */
import { randomBytes } from 'crypto';

const SESSION_MS = 7 * 24 * 60 * 60 * 1000;
const sessions = new Map();

export function createSession(userId, email) {
  const token = randomBytes(32).toString('hex');
  const expiresAt = Date.now() + SESSION_MS;
  sessions.set(token, { userId, email, expiresAt });
  return { token, expiresAt };
}

export function getSession(token) {
  if (!token || typeof token !== 'string') return null;
  const s = sessions.get(token);
  if (!s) return null;
  if (s.expiresAt < Date.now()) {
    sessions.delete(token);
    return null;
  }
  return s;
}

export function deleteSession(token) {
  if (token) sessions.delete(token);
}
