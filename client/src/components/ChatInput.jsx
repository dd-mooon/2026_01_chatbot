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
      className="shrink-0 bg-white border-t border-slate-200/80 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.08)]"
    >
      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="질문을 입력하세요"
            className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-[15px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="shrink-0 px-5 py-3 rounded-xl bg-teal-600 text-white font-semibold text-sm hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
          >
            전송
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {faqChips.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => { onSendMessage(q); setInput(''); }}
              className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium hover:bg-slate-200 hover:text-slate-800 transition"
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </form>
  );
}
