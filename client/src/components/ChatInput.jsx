/**
 * 채팅 입력 영역
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
    <form
      onSubmit={handleSubmit}
      className="shrink-0 bg-[#faf9f8] border-t border-[#edebe9]"
    >
      <div className="max-w-2xl mx-auto px-4 py-3">
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="새 메시지 입력"
            className="flex-1 rounded-md border border-[#edebe9] px-3 py-2 text-[14px] placeholder:text-[#8a8886] focus:outline-none focus:ring-1 focus:ring-[#6264a7] focus:border-[#6264a7] bg-white transition"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="shrink-0 p-2 rounded-md bg-[#6264a7] text-white hover:bg-[#5052a3] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="전송"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="rotate-[-45deg]">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {faqChips.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => { onSendMessage(q); setInput(''); }}
              className="px-2.5 py-1 rounded-md bg-white border border-[#edebe9] text-[#605e5c] text-xs font-medium hover:bg-[#e8e8f7] hover:border-[#6264a7]/30 hover:text-[#6264a7] transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </form>
  );
}
