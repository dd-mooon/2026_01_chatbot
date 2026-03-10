/**
 * 파일 업로드 미들웨어 (multer)
 */
import multer from 'multer';
import fs from 'fs';
import { UPLOADS_DIR } from '../config.js';

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const safeName = Buffer.from(file.originalname, 'latin1').toString('utf8').replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, Date.now() + '-' + safeName);
  },
});

export const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });
