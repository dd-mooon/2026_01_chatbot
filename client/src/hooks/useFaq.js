/**
 * 자주 묻는 질문 (FAQ) API 훅
 */
import { useState, useEffect } from 'react';
import { API_BASE } from '../config/constants.js';

const DEFAULT_FAQ = ['건전지 어디 있어?', '회식 언제야?', '연차는 며칠이야?'];

export function useFaq() {
  const [faqChips, setFaqChips] = useState(DEFAULT_FAQ);

  useEffect(() => {
    fetch(`${API_BASE}/api/faq`)
      .then((res) => res.json())
      .then((data) => {
        if (data.chips && data.chips.length > 0) {
          setFaqChips(data.chips);
        }
      })
      .catch(() => {});
  }, []);

  return faqChips;
}
