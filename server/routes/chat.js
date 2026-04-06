/**
 * 채팅 API 라우트
 */
import { Router } from 'express';
import { findExactMatch } from '../services/knowledge.js';
import { addUnanswered } from '../services/unanswered.js';
import { searchKnowledge } from '../services/chroma.js';
import {
  getAnswerFromOllama,
  getGeneralKnowledgeReplyFromOllama,
  FALLBACK_NO_KNOWLEDGE,
  GENERAL_KNOWLEDGE_DISCLAIMER,
} from '../services/ollama.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { question } = req.body;
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'question 필드(문자열)가 필요합니다.' });
    }

    const trimmedQuestion = question.trim();

    const exactMatch = findExactMatch(trimmedQuestion);
    if (exactMatch) {
      return res.json({
        answer: exactMatch.answer,
        refLink: exactMatch.refLink,
        attachmentUrl: exactMatch.attachmentUrl || null,
        attachmentName: exactMatch.attachmentName || null,
        type: 'exact_match',
        matchedKeyword: exactMatch.matchedKeyword,
        sources: [],
      });
    }

    const sources = await searchKnowledge(trimmedQuestion);

    if (sources.length === 0) {
      addUnanswered(trimmedQuestion);
      try {
        const answer = await getGeneralKnowledgeReplyFromOllama(trimmedQuestion);
        return res.json({
          answer,
          type: 'no_match',
          sources: [],
          generalKnowledge: true,
          disclaimer: GENERAL_KNOWLEDGE_DISCLAIMER,
        });
      } catch (ollamaErr) {
        console.error('LLM 오류(no_match):', ollamaErr.message);
        return res.json({
          answer: FALLBACK_NO_KNOWLEDGE,
          type: 'no_match',
          sources: [],
          ollamaFailed: true,
          ollamaError: ollamaErr.message,
        });
      }
    }

    const contextText = sources.map((s) => s.text).join('\n\n');
    try {
      const answer = await getAnswerFromOllama(contextText, trimmedQuestion);
      const firstMeta = sources[0]?.metadata || {};
      res.json({
        answer,
        type: 'rag',
        refLink: firstMeta.refLink || null,
        attachmentUrl: firstMeta.attachmentUrl || null,
        attachmentName: firstMeta.attachmentName || null,
        sources: sources.map((s) => ({ text: s.text, metadata: s.metadata })),
      });
    } catch (ollamaErr) {
      console.error('LLM 오류(rag):', ollamaErr.message);
      addUnanswered(trimmedQuestion);
      res.status(503).json({
        error: '답변 생성 중 오류가 발생했습니다.',
        detail:
          ollamaErr.message ||
          'LLM 서비스를 확인해 주세요. GET /api/ollama-status (Groq 키 또는 Ollama 실행 여부).',
      });
    }
  } catch (err) {
    console.error('/api/chat error:', err);
    res.status(500).json({ error: '답변 생성 중 오류가 발생했습니다.', detail: err.message });
  }
});

export default router;
