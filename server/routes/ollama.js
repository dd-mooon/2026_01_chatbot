/**
 * Ollama 상태 API 라우트
 */
import { Router } from 'express';
import { ollama, OLLAMA_MODEL } from '../services/ollama.js';

const router = Router();

async function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(`${label} 응답 시간 초과`)), ms)),
  ]);
}

router.get('/', async (req, res) => {
  try {
    const list = await ollama.list();
    const models = list.models?.map((m) => m.name) ?? [];
    const hasModel = models.some((name) => name === OLLAMA_MODEL || name.startsWith(OLLAMA_MODEL.split(':')[0]));

    const payload = {
      ok: true,
      host: process.env.OLLAMA_HOST || 'http://127.0.0.1:11434',
      model: OLLAMA_MODEL,
      models,
      modelAvailable: hasModel,
      message: hasModel ? 'Ollama 연결됨, 사용 모델 있음' : `Ollama 연결됨. 사용할 모델 "${OLLAMA_MODEL}" 없음. 설치: ollama pull ${OLLAMA_MODEL}`,
    };

    if (req.query.test === 'chat' && hasModel) {
      try {
        const OLLAMA_TIMEOUT_MS = Number(process.env.OLLAMA_TIMEOUT_MS) || 120000;
        const chatRes = await withTimeout(
          ollama.chat({ model: OLLAMA_MODEL, messages: [{ role: 'user', content: '한 줄로 "테스트 성공"이라고만 답하세요.' }] }),
          Math.min(OLLAMA_TIMEOUT_MS, 60000),
          'Ollama(테스트)'
        );
        payload.chatTest = { ok: true, reply: (chatRes.message?.content ?? '').trim().slice(0, 200) };
      } catch (chatErr) {
        payload.chatTest = { ok: false, error: chatErr.message };
      }
    }

    res.json(payload);
  } catch (err) {
    console.error('Ollama 상태 확인 실패:', err.message);
    res.status(503).json({
      ok: false,
      error: err.message,
      message: 'Ollama에 연결할 수 없습니다. Ollama가 실행 중인지 확인하세요. (curl http://localhost:11434/api/tags)',
    });
  }
});

export default router;
