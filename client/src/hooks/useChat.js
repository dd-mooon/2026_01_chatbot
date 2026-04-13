/**
 * 채팅 API 훅
 */
import { useState, useCallback } from 'react';
import { API_BASE } from '../config/constants.js';

export function useChat() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = useCallback(async (question) => {
    const text = (typeof question === 'string' ? question : '').trim();
    if (!text) return;

    setMessages((prev) => [...prev, { role: 'user', content: text, timestamp: Date.now() }]);
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: text }),
      });
      const raw = await res.text();
      let data;
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        throw new Error('서버에 연결할 수 없습니다. server 폴더에서 npm start를 실행해 주세요.');
      }

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.error || data.detail || '오류가 발생했습니다.', refLink: null, timestamp: Date.now() },
        ]);
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.answer,
          refLink: data.refLink || null,
          attachmentUrl: data.attachmentUrl || null,
          attachmentName: data.attachmentName || null,
          type: data.type,
          sources: Array.isArray(data.sources) ? data.sources : [],
          ollamaFailed: data.ollamaFailed ?? false,
          ollamaError: data.ollamaError || null,
          generalKnowledge: data.generalKnowledge ?? false,
          disclaimer: data.disclaimer || null,
          timestamp: Date.now(),
        },
      ]);
    } catch (err) {
      setError(err.message);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '서버에 연결할 수 없습니다. server 폴더에서 npm start를 실행해 주세요.', refLink: null, timestamp: Date.now() },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { messages, loading, error, sendMessage };
}
