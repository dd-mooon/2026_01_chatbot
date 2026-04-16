/**
 * 파일 업로드 미들웨어 (multer)
 * 디스크 파일명은 ASCII만 사용(호환). 표시용 이름은 req.file.originalname + 업로드 라우트에서 UTF-8 정규화.
 */
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { randomBytes } from 'crypto';
import { UPLOADS_DIR } from '../config.js';

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const raw = file.originalname || 'file';
    const ext = path.extname(raw).toLowerCase().replace(/[^.a-z0-9]/g, '');
    const safeExt = ext.length > 0 && ext.length <= 16 ? ext : '';
    cb(null, `${Date.now()}-${randomBytes(8).toString('hex')}${safeExt}`);
  },
});

export const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });
