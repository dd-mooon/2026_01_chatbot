/**
 * 자주 묻는 질문 (FAQ) - 지식 ID 기반, 최대 3개
 */
import fs from 'fs';
import path from 'path';
import { FAQ_FILE, FAQ_MAX } from '../config.js';
import { loadExactMatchKnowledge } from './knowledge.js';

export function loadFaqIds() {
  try {
    const data = JSON.parse(fs.readFileSync(FAQ_FILE, 'utf-8'));
    const ids = Array.isArray(data) ? data : (data.ids || []);
    return ids.slice(0, FAQ_MAX);
  } catch (err) {
    if (err.code !== 'ENOENT') console.error('FAQ 로드 실패:', err.message);
    return [];
  }
}

export function saveFaqIds(ids) {
  const dir = path.dirname(FAQ_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const trimmed = Array.isArray(ids) ? ids.slice(0, FAQ_MAX) : [];
  fs.writeFileSync(FAQ_FILE, JSON.stringify(trimmed, null, 2), 'utf-8');
}

export function getFaqChips() {
  const ids = loadFaqIds();
  const knowledge = loadExactMatchKnowledge();
  const validIds = [];
  const chips = ids
    .map((id) => {
      const item = knowledge.find((k) => k.id === id);
      if (!item || !item.keywords?.length) return null;
      validIds.push(id);
      return item.keywords[0];
    })
    .filter(Boolean);
  if (validIds.length !== ids.length) saveFaqIds(validIds);
  return chips;
}
