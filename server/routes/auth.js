/**
 * 관리자 로그인 / 회원가입 / 승인
 */
import { Router } from 'express';
import {
  createUser,
  verifyLogin,
  validateEmail,
  validatePassword,
  findUserById,
  listPendingUsers,
  approvePendingUser,
  rejectPendingUser,
  isActiveSuperAdmin,
} from '../services/adminUsers.js';
import { createSession, deleteSession, getSession } from '../services/adminSessions.js';
import { ADMIN_EMAIL_DOMAIN } from '../config.js';
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
    const result = createUser(email, password);
    if (!result.ok) {
      return res.status(400).json({ error: result.error });
    }
    if (result.user.status === 'active') {
      const { token } = createSession(result.user.id, result.user.email);
      setSessionCookie(res, token);
      return res.status(201).json({
        message: result.bootstrap
          ? '최고 관리자로 가입되었습니다.'
          : '가입되었습니다. 바로 로그인되었습니다.',
        user: { email: result.user.email, role: result.user.role },
      });
    }
    return res.status(201).json({
      pending: true,
      message:
        '가입 요청이 접수되었습니다. 최고 관리자 승인 후 같은 비밀번호로 로그인할 수 있습니다.',
      user: { email: result.user.email },
    });
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
    if (result.code === 'pending') {
      return res.status(403).json({
        error: '가입 승인 대기 중입니다. 최고 관리자에게 승인을 요청하세요.',
      });
    }
    if (!result.ok) {
      return res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }
    const { token } = createSession(result.user.id, result.user.email);
    setSessionCookie(res, token);
    res.json({
      message: '로그인되었습니다.',
      user: { email: result.user.email, role: result.user.role },
    });
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
  const user = findUserById(s.userId);
  if (!user || user.status !== 'active') {
    return res.status(401).json({ error: '로그인되지 않았습니다.' });
  }
  res.json({
    user: {
      email: s.email,
      role: user.role || 'admin',
      status: user.status,
    },
  });
});

router.get('/pending-registrations', (req, res) => {
  try {
    const token = getSessionTokenFromReq(req);
    const s = getSession(token);
    if (!s) {
      return res.status(401).json({ error: '로그인이 필요합니다.' });
    }
    const actor = findUserById(s.userId);
    if (!isActiveSuperAdmin(actor)) {
      return res.status(403).json({ error: '최고 관리자만 조회할 수 있습니다.' });
    }
    const pending = listPendingUsers().map((u) => ({
      id: u.id,
      email: u.email,
      createdAt: u.createdAt,
    }));
    res.json({ pending });
  } catch (err) {
    console.error('GET /api/auth/pending-registrations:', err);
    res.status(500).json({ error: '목록을 불러오지 못했습니다.' });
  }
});

router.post('/approve-registration', (req, res) => {
  try {
    const token = getSessionTokenFromReq(req);
    const s = getSession(token);
    if (!s) {
      return res.status(401).json({ error: '로그인이 필요합니다.' });
    }
    const { userId } = req.body || {};
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'userId가 필요합니다.' });
    }
    const result = approvePendingUser(s.userId, userId);
    if (!result.ok) {
      return res.status(result.error.includes('찾을 수 없') ? 404 : 403).json({ error: result.error });
    }
    res.json({ message: '승인되었습니다.', user: result.user });
  } catch (err) {
    console.error('POST /api/auth/approve-registration:', err);
    res.status(500).json({ error: '승인 처리 중 오류가 발생했습니다.' });
  }
});

router.post('/reject-registration', (req, res) => {
  try {
    const token = getSessionTokenFromReq(req);
    const s = getSession(token);
    if (!s) {
      return res.status(401).json({ error: '로그인이 필요합니다.' });
    }
    const { userId } = req.body || {};
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'userId가 필요합니다.' });
    }
    const result = rejectPendingUser(s.userId, userId);
    if (!result.ok) {
      const st = result.error.includes('찾을 수 없') ? 404 : 403;
      return res.status(st).json({ error: result.error });
    }
    res.json({ message: '가입 요청을 거절했습니다.' });
  } catch (err) {
    console.error('POST /api/auth/reject-registration:', err);
    res.status(500).json({ error: '처리 중 오류가 발생했습니다.' });
  }
});

export default router;
