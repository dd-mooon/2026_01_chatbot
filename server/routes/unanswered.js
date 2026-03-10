/**
 * 미답변 질문 API 라우트
 */
import { Router } from 'express';
import { loadUnanswered, saveUnanswered } from '../services/unanswered.js';

const router = Router();

router.get('/', (req, res) => {
  try {
    res.json({ unanswered: loadUnanswered() });
  } catch (err) {
    console.error('GET /api/unanswered error:', err);
    res.status(500).json({ error: '미답변 목록을 불러오지 못했습니다.', detail: err.message });
  }
});

router.delete('/bulk', (req, res) => {
  try {
    const { ids } = req.body || {};
    const list = loadUnanswered();
    let removed;
    if (ids && Array.isArray(ids) && ids.length > 0) {
      removed = list.filter((item) => ids.includes(item.id));
      saveUnanswered(list.filter((item) => !ids.includes(item.id)));
    } else {
      removed = [...list];
      saveUnanswered([]);
    }
    res.json({ message: removed.length + '개 제거되었습니다.', removed: removed.length });
  } catch (err) {
    console.error('DELETE /api/unanswered/bulk error:', err);
    res.status(500).json({ error: '제거에 실패했습니다.', detail: err.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const list = loadUnanswered();
    const index = list.findIndex((item) => item.id === id);
    if (index === -1) {
      return res.status(404).json({ error: '해당 id의 미답변 항목을 찾을 수 없습니다.' });
    }
    const [removed] = list.splice(index, 1);
    saveUnanswered(list);
    res.json({ message: '미답변 목록에서 제거되었습니다.', item: removed });
  } catch (err) {
    console.error('DELETE /api/unanswered error:', err);
    res.status(500).json({ error: '제거에 실패했습니다.', detail: err.message });
  }
});

export default router;
