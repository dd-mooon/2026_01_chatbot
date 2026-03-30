/**
 * 관리자 로그인 / 회원가입
 */
import { Router } from 'express';
import {
  createUser,
  verifyLogin,
  validateEmail,
  validatePassword,
  listUsers,
} from '../services/adminUsers.js';
import { createSession, deleteSession, getSession } from '../services/adminSessions.js';
import { ADMIN_SIGNUP_OPEN, ADMIN_EMAIL_DOMAIN } from '../config.js';
import { getSessionTokenFromReq, COOKIE_NAME } from '../middleware/requireAdminAuth.js';

const router = Router();

function setSessionCookie(res, token) {
  const maxAge = 7 * 24 * 60 * 60 * 1000;
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    maxAge,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
}

function clearSessionCookie(res) {
  res.clearCookie(COOKIE_NAME, { path: '/' });
}

router.post('/register', (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!validateEmail(email)) {
      return res.status(400).json({ error: `사내 이메일(${ADMIN_EMAIL_DOMAIN})만 사용할 수 있습니다.` });
    }
    if (!validatePassword(password)) {
      return res.status(400).json({ error: '비밀번호는 8자 이상 128자 이하여야 합니다.' });
    }
    const users = listUsers();
    if (users.length > 0 && !ADMIN_SIGNUP_OPEN) {
      return res.status(403).json({
        error: '회원가입이 비활성화되어 있습니다. 첫 계정만 등록 가능하거나 관리자에게 문의하세요.',
        hint: '추가 가입이 필요하면 서버에 ADMIN_SIGNUP_OPEN=true 를 설정하세요.',
      });
    }
    const result = createUser(email, password);
    if (!result.ok) {
      return res.status(400).json({ error: result.error });
    }
    const { token } = createSession(result.user.id, result.user.email);
    setSessionCookie(res, token);
    res.status(201).json({ message: '가입되었습니다.', user: { email: result.user.email } });
  } catch (err) {
    console.error('POST /api/auth/register:', err);
    res.status(500).json({ error: '회원가입 처리 중 오류가 발생했습니다.' });
  }
});

router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!validateEmail(email) || !password) {
      return res.status(400).json({
        error: email && !validateEmail(email)
          ? `사내 이메일(@${ADMIN_EMAIL_DOMAIN})만 로그인할 수 있습니다.`
          : '이메일과 비밀번호를 입력하세요.',
      });
    }
    const result = verifyLogin(email, password);
    if (!result.ok) {
      return res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }
    const { token } = createSession(result.user.id, result.user.email);
    setSessionCookie(res, token);
    res.json({ message: '로그인되었습니다.', user: { email: result.user.email } });
  } catch (err) {
    console.error('POST /api/auth/login:', err);
    res.status(500).json({ error: '로그인 처리 중 오류가 발생했습니다.' });
  }
});

router.post('/logout', (req, res) => {
  const token = getSessionTokenFromReq(req);
  deleteSession(token);
  clearSessionCookie(res);
  res.json({ message: '로그아웃되었습니다.' });
});

router.get('/me', (req, res) => {
  const token = getSessionTokenFromReq(req);
  const s = getSession(token);
  if (!s) {
    return res.status(401).json({ error: '로그인되지 않았습니다.' });
  }
  res.json({ user: { email: s.email } });
});

export default router;
