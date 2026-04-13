/**
 * 자주 묻는 질문 (FAQ) API 훅
 */
import { useState, useEffect } from 'react';
import { API_BASE, FAQ_CHIPS } from '../config/constants.js';

export function useFaq() {
  const [faqChips, setFaqChips] = useState(FAQ_CHIPS);

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
