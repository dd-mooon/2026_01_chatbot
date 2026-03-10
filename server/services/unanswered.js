/**
 * 미답변 질문 저장
 */
import fs from 'fs';
import { UNANSWERED_FILE } from '../config.js';

export function loadUnanswered() {
  try {
    return JSON.parse(fs.readFileSync(UNANSWERED_FILE, 'utf-8'));
  } catch (err) {
    if (err.code !== 'ENOENT') console.error('미답변 목록 로드 실패:', err.message);
    return [];
  }
}

export function saveUnanswered(data) {
  fs.writeFileSync(UNANSWERED_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export function addUnanswered(question) {
  const list = loadUnanswered();
  const q = question.trim();
  if (!q) return;
  if (list.some((item) => item.question === q)) return;
  list.push({ id: String(Date.now()), question: q, createdAt: new Date().toISOString() });
  saveUnanswered(list);
}
