/**
 * 관리자 계정 저장 (비밀번호 scrypt 해시)
 */
import fs from 'fs';
import path from 'path';
import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { ADMIN_USERS_FILE, ADMIN_EMAIL_DOMAIN } from '../config.js';

function loadRaw() {
  try {
    const data = JSON.parse(fs.readFileSync(ADMIN_USERS_FILE, 'utf-8'));
    return { users: Array.isArray(data.users) ? data.users : [] };
  } catch (err) {
    if (err.code !== 'ENOENT') console.error('admin-users 로드 실패:', err.message);
    return { users: [] };
  }
}

function saveRaw(data) {
  const dir = path.dirname(ADMIN_USERS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(ADMIN_USERS_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export function listUsers() {
  return loadRaw().users;
}

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  if (!stored || typeof stored !== 'string' || !stored.includes(':')) return false;
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  try {
    const hashBuf = Buffer.from(hash, 'hex');
    const test = scryptSync(password, salt, 64);
    return hashBuf.length === test.length && timingSafeEqual(hashBuf, test);
  } catch {
    return false;
  }
}

const SUFFIX = `@${ADMIN_EMAIL_DOMAIN}`;

/** @concentrix.com 만 허용 (로컬 파트: 영문·숫자·._+-) */
export function validateEmail(email) {
  if (typeof email !== 'string') return false;
  const e = email.trim().toLowerCase();
  if (e.length > 120 || !e.endsWith(SUFFIX)) return false;
  const local = e.slice(0, -SUFFIX.length);
  if (local.length < 1 || local.length > 64) return false;
  if (local.includes('@')) return false;
  return /^[a-zA-Z0-9._+-]+$/.test(local);
}

export function validatePassword(password) {
  return typeof password === 'string' && password.length >= 8 && password.length <= 128;
}

export function findUserByEmail(email) {
  const e = email.trim().toLowerCase();
  return listUsers().find((u) => u.email === e) || null;
}

export function createUser(email, password) {
  const e = email.trim().toLowerCase();
  const data = loadRaw();
  const { users } = data;
  if (users.some((u) => u.email === e)) {
    return { ok: false, error: '이미 등록된 이메일입니다.' };
  }
  const id = randomBytes(12).toString('hex');
  const passwordHash = hashPassword(password);
  users.push({
    id,
    email: e,
    passwordHash,
    createdAt: new Date().toISOString(),
  });
  saveRaw({ users });
  return { ok: true, user: { id, email: e } };
}

export function verifyLogin(email, password) {
  const user = findUserByEmail(email);
  if (!user) return { ok: false };
  if (!verifyPassword(password, user.passwordHash)) return { ok: false };
  return { ok: true, user: { id: user.id, email: user.email } };
}
