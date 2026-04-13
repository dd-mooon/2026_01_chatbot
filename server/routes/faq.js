/**
 * 자주 묻는 질문 (FAQ) API
 */
import { Router } from 'express';
import { loadFaqIds, saveFaqIds, getFaqChips } from '../services/faq.js';
import { FAQ_MAX } from '../config.js';
import { requireAdminAuth } from '../middleware/requireAdminAuth.js';

const router = Router();

router.get(['/', ''], (req, res) => {
  try {
    const ids = loadFaqIds();
    const chips = getFaqChips();
    res.json({ ids, chips, max: FAQ_MAX });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/', requireAdminAuth, (req, res) => {
  try {
    const { ids } = req.body || {};
    const arr = Array.isArray(ids) ? ids : [];
    if (arr.length > FAQ_MAX) {
      return res.status(400).json({ error: `최대 ${FAQ_MAX}개까지 선택 가능합니다.` });
    }
    saveFaqIds(arr);
    const chips = getFaqChips();
    res.json({ message: '저장되었습니다.', ids: arr, chips });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
