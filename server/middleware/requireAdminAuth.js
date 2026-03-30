/**
 * 관리자 로그인(쿠키 세션) 필요
 */
import { getSession } from '../services/adminSessions.js';

const COOKIE_NAME = 'connie_admin';

export function getSessionTokenFromReq(req) {
  const raw = req.cookies && req.cookies[COOKIE_NAME];
  return typeof raw === 'string' ? raw : null;
}

export function requireAdminAuth(req, res, next) {
  const token = getSessionTokenFromReq(req);
  const s = getSession(token);
  if (!s) {
    return res.status(401).json({ error: '로그인이 필요합니다.' });
  }
  req.adminUser = { id: s.userId, email: s.email };
  next();
}

export { COOKIE_NAME };
