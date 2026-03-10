/**
 * 지식 CRUD API 라우트
 */
import { Router } from 'express';
import {
  loadExactMatchKnowledge,
  saveExactMatchKnowledge,
  generateNewId,
} from '../services/knowledge.js';
import { addToChromaDB, updateInChromaDB, deleteFromChromaDB } from '../services/chroma.js';

const router = Router();

router.get('/', (req, res) => {
  try {
    res.json({ knowledge: loadExactMatchKnowledge() });
  } catch (err) {
    console.error('GET /api/knowledge error:', err);
    res.status(500).json({ error: '지식 목록을 불러오지 못했습니다.', detail: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { keywords, answer, refLink, attachmentUrl, attachmentName } = req.body;
    if (!keywords || !Array.isArray(keywords) || keywords.length === 0 || !answer || typeof answer !== 'string') {
      return res.status(400).json({ error: 'keywords(배열), answer(문자열)가 필요합니다.' });
    }

    const id = generateNewId();
    const item = {
      id,
      keywords,
      answer: answer.trim(),
      refLink: refLink?.trim() || '',
      attachmentUrl: attachmentUrl?.trim() || '',
      attachmentName: attachmentName?.trim() || '',
    };

    const list = loadExactMatchKnowledge();
    list.push(item);
    saveExactMatchKnowledge(list);

    const chromaOk = await addToChromaDB(id, item.answer, item.refLink, item.attachmentUrl, item.attachmentName);
    if (!chromaOk) console.warn('ChromaDB 추가 실패했지만 JSON에는 저장되었습니다.');

    res.status(201).json({ message: '지식이 추가되었습니다.', item });
  } catch (err) {
    console.error('POST /api/knowledge error:', err);
    res.status(500).json({ error: '지식 추가에 실패했습니다.', detail: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { keywords, answer, refLink, attachmentUrl, attachmentName } = req.body;

    const list = loadExactMatchKnowledge();
    const index = list.findIndex((item) => item.id === id);
    if (index === -1) {
      return res.status(404).json({ error: '해당 id의 지식을 찾을 수 없습니다.' });
    }

    const prev = list[index];
    const updated = {
      id,
      keywords: Array.isArray(keywords) ? keywords : prev.keywords,
      answer: typeof answer === 'string' ? answer.trim() : prev.answer,
      refLink: refLink !== undefined ? String(refLink).trim() : prev.refLink,
      attachmentUrl: attachmentUrl !== undefined ? String(attachmentUrl).trim() : (prev.attachmentUrl || ''),
      attachmentName: attachmentName !== undefined ? String(attachmentName).trim() : (prev.attachmentName || ''),
    };
    list[index] = updated;
    saveExactMatchKnowledge(list);

    const chromaOk = await updateInChromaDB(id, updated.answer, updated.refLink, updated.attachmentUrl, updated.attachmentName);
    if (!chromaOk) console.warn('ChromaDB 수정 실패했지만 JSON에는 반영되었습니다.');

    res.json({ message: '지식이 수정되었습니다.', item: updated });
  } catch (err) {
    console.error('PUT /api/knowledge error:', err);
    res.status(500).json({ error: '지식 수정에 실패했습니다.', detail: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const list = loadExactMatchKnowledge();
    const index = list.findIndex((item) => item.id === id);
    if (index === -1) {
      return res.status(404).json({ error: '해당 id의 지식을 찾을 수 없습니다.' });
    }

    const [removed] = list.splice(index, 1);
    saveExactMatchKnowledge(list);
    await deleteFromChromaDB(id);

    res.json({ message: '지식이 삭제되었습니다.', item: removed });
  } catch (err) {
    console.error('DELETE /api/knowledge error:', err);
    res.status(500).json({ error: '지식 삭제에 실패했습니다.', detail: err.message });
  }
});

export default router;
