/**
 * Exact Match 지식 CRUD
 */
import fs from 'fs';
import { EXACT_MATCH_FILE } from '../config.js';

export function loadExactMatchKnowledge() {
  try {
    return JSON.parse(fs.readFileSync(EXACT_MATCH_FILE, 'utf-8'));
  } catch (err) {
    console.error('Exact Match 지식 데이터 로드 실패:', err.message);
    return [];
  }
}

export function saveExactMatchKnowledge(data) {
  fs.writeFileSync(EXACT_MATCH_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export function generateNewId() {
  const list = loadExactMatchKnowledge();
  const max = list.reduce((acc, item) => Math.max(acc, Number(item.id) || 0), 0);
  return String(max + 1);
}

export function findExactMatch(question) {
  const knowledge = loadExactMatchKnowledge();
  const questionLower = question.toLowerCase().trim();

  for (const item of knowledge) {
    const matchedKeyword = item.keywords.find((keyword) =>
      questionLower.includes(keyword.toLowerCase())
    );
    if (matchedKeyword) {
      return {
        answer: item.answer,
        refLink: item.refLink,
        attachmentUrl: item.attachmentUrl || '',
        attachmentName: item.attachmentName || '',
        matchedKeyword,
        type: 'exact_match',
      };
    }
  }
  return null;
}
