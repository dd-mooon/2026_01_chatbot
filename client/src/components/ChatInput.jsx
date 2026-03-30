/**
 * 채팅 입력 영역 — 제안 칩 + 입력 + 전송 + 면책 문구
 */
import { useState } from 'react';

export default function ChatInput({ onSendMessage, loading, faqChips = [] }) {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    onSendMessage(text);
    setInput('');
  };

  return (
    <div className="shrink-0 bg-white border-t border-slate-200/90 shadow-[0_-4px_24px_-8px_rgba(15,23,42,0.06)]">
      <div className="max-w-2xl mx-auto px-4 sm:px-5 pt-3 pb-4 safe-area-pb">
        {faqChips.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {faqChips.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => {
                  onSendMessage(q);
                  setInput('');
                }}
                className="px-3.5 py-2 rounded-full text-[13px] font-medium bg-slate-100/90 border border-slate-200/80 text-[#0f172a] hover:bg-[#e8f4f4] hover:border-[#b8d9d9] hover:text-[#006666] transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex gap-2.5 items-end">
          <div className="flex-1 flex items-center min-w-0 rounded-[1.25rem] border border-slate-200 bg-slate-50/50 px-4 py-2 transition-shadow focus-within:bg-white focus-within:border-[#006666]/35 focus-within:shadow-[0_0_0_3px_rgba(0,102,102,0.12)]">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="코니에게 메시지 보내기"
              className="flex-1 min-w-0 border-0 bg-transparent py-1.5 text-[15px] text-[#0f172a] placeholder:text-slate-400 focus:outline-none focus:ring-0"
              disabled={loading}
            >
            </input>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="shrink-0 h-11 w-11 rounded-full bg-[#006666] text-white shadow-sm hover:bg-[#005858] active:scale-[0.98] disabled:opacity-45 disabled:cursor-not-allowed transition-all flex items-center justify-center"
            aria-label="전송"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="ml-0.5 -translate-y-px">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </form>
        <p className="text-center text-[11px] text-slate-400 mt-3 leading-relaxed px-2">
          코니 어시스턴트는 실수할 수 있습니다. 중요한 정보는 반드시 확인하세요.
        </p>
      </div>
    </div>
  );
}
