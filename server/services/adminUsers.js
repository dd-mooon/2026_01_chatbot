/**
 * 관리자 계정 저장 (비밀번호 scrypt 해시)
 * - role: superadmin | admin
 * - status: active | pending
 */
import fs from 'fs';
import path from 'path';
import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { ADMIN_USERS_FILE, ADMIN_EMAIL_DOMAIN, getSuperadminPromotionEmails } from '../config.js';

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

/** 레거시 users에 role/status 없으면: 가장 오래된 계정 = superadmin·active, 나머지 admin·active */
function migrateLegacyUsers(users) {
  if (!users.length || !users.some((u) => !u.role || !u.status)) return false;
  const byCreated = [...users].sort(
    (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
  );
  const superId = byCreated[0].id;
  for (const u of users) {
    if (!u.status) u.status = 'active';
    if (!u.role) u.role = u.id === superId ? 'superadmin' : 'admin';
  }
  return true;
}

let migrationDone = false;

function ensureMigrated() {
  if (migrationDone) return;
  const data = loadRaw();
  if (migrateLegacyUsers(data.users)) {
    saveRaw(data);
  }
  migrationDone = true;
}

export function listUsers() {
  ensureMigrated();
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
  ensureMigrated();
  const e = email.trim().toLowerCase();
  return listUsers().find((u) => u.email === e) || null;
}

export function findUserById(id) {
  ensureMigrated();
  return listUsers().find((u) => u.id === id) || null;
}

/** 서버 기동 시: 설정된 이메일은 superadmin·active로 맞춤(이미 가입된 pending 계정 승격). */
export function promoteConfiguredSuperAdmins() {
  const promo = getSuperadminPromotionEmails();
  if (!promo.size) return;
  ensureMigrated();
  const data = loadRaw();
  let changed = false;
  for (const u of data.users) {
    if (!promo.has(u.email)) continue;
    if (u.role !== 'superadmin' || u.status !== 'active') {
      u.role = 'superadmin';
      u.status = 'active';
      changed = true;
    }
  }
  if (changed) saveRaw(data);
}

/**
 * 첫 계정(bootstrap): superadmin + active, 즉시 로그인 가능.
 * 이후: admin + pending, 최고관리자 승인 후 로그인.
 * getSuperadminPromotionEmails()에 포함된 이메일은 bootstrap이 아니어도 superadmin·active로 즉시 가입.
 */
export function createUser(email, password) {
  const e = email.trim().toLowerCase();
  ensureMigrated();
  const data = loadRaw();
  const { users } = data;
  if (users.some((u) => u.email === e)) {
    return { ok: false, error: '이미 등록된 이메일입니다.' };
  }
  const id = randomBytes(12).toString('hex');
  const passwordHash = hashPassword(password);
  const isBootstrap = users.length === 0;
  const promo = getSuperadminPromotionEmails();
  const forceSuper = promo.has(e);
  const role = isBootstrap || forceSuper ? 'superadmin' : 'admin';
  const status = isBootstrap || forceSuper ? 'active' : 'pending';
  users.push({
    id,
    email: e,
    passwordHash,
    role,
    status,
    createdAt: new Date().toISOString(),
  });
  saveRaw({ users });
  return {
    ok: true,
    user: { id, email: e, role, status },
    bootstrap: isBootstrap,
  };
}

/** @returns {{ ok: true, user } | { ok: false, code?: 'pending'|'invalid' }} */
export function verifyLogin(email, password) {
  const user = findUserByEmail(email);
  if (!user) return { ok: false, code: 'invalid' };
  if (user.status === 'pending') return { ok: false, code: 'pending' };
  if (user.status !== 'active') return { ok: false, code: 'invalid' };
  if (!verifyPassword(password, user.passwordHash)) return { ok: false, code: 'invalid' };
  return {
    ok: true,
    user: { id: user.id, email: user.email, role: user.role, status: user.status },
  };
}

export function listPendingUsers() {
  return listUsers().filter((u) => u.status === 'pending');
}

export function isActiveSuperAdmin(user) {
  return Boolean(user && user.role === 'superadmin' && user.status === 'active');
}

export function approvePendingUser(actorId, targetId) {
  const actor = findUserById(actorId);
  if (!isActiveSuperAdmin(actor)) {
    return { ok: false, error: '최고 관리자만 승인할 수 있습니다.' };
  }
  const data = loadRaw();
  const target = data.users.find((u) => u.id === targetId);
  if (!target || target.status !== 'pending') {
    return { ok: false, error: '승인 대기 중인 사용자를 찾을 수 없습니다.' };
  }
  target.status = 'active';
  saveRaw(data);
  return { ok: true, user: { id: target.id, email: target.email } };
}

export function rejectPendingUser(actorId, targetId) {
  const actor = findUserById(actorId);
  if (!isActiveSuperAdmin(actor)) {
    return { ok: false, error: '최고 관리자만 거절할 수 있습니다.' };
  }
  const data = loadRaw();
  const idx = data.users.findIndex((u) => u.id === targetId);
  if (idx === -1) return { ok: false, error: '사용자를 찾을 수 없습니다.' };
  const target = data.users[idx];
  if (target.status !== 'pending') {
    return { ok: false, error: '승인 대기 중인 계정만 거절할 수 있습니다.' };
  }
  data.users.splice(idx, 1);
  saveRaw(data);
  return { ok: true };
}
