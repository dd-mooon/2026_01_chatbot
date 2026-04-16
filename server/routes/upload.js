/**
 * 파일 업로드 API 라우트
 */
import { Router } from 'express';
import { upload } from '../middleware/upload.js';
import { normalizeMultipartOriginalName } from '../utils/filenameUtf8.js';

const router = Router();

router.post('/', (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: '파일 크기가 20MB를 초과합니다.' });
      }
      console.error('POST /api/upload multer error:', err);
      return res.status(400).json({ error: '파일 업로드에 실패했습니다.', detail: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ error: '파일을 선택한 뒤 업로드 버튼을 눌러주세요.' });
    }
    res.json({
      url: '/uploads/' + req.file.filename,
      name: normalizeMultipartOriginalName(req.file.originalname),
    });
  });
});

export default router;
