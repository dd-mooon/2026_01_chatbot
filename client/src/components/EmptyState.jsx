/**
 * 빈 화면 - 자주 묻는 질문 칩
 */
import BotAvatar from '../BotAvatar';

export default function EmptyState({ onSendMessage, faqChips = [] }) {
  return (
    <div className="text-center pt-12 pb-8">
      <div className="inline-block mb-6">
        <BotAvatar size={72} />
      </div>
      <p className="text-slate-600 font-medium text-lg mb-1">무엇이든 물어보세요</p>
      <p className="text-slate-500 text-sm mb-6">사내 규정, 자리배치, 연차·회식 안내 등</p>
      <p className="text-xs text-slate-400 mb-3">자주 묻는 질문</p>
      <div className="flex flex-wrap gap-2 justify-center">
        {faqChips.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => onSendMessage(q)}
            className="px-4 py-2.5 rounded-full bg-white text-slate-700 text-sm font-medium shadow-sm border border-slate-200/80 hover:border-teal-300 hover:bg-teal-50/80 hover:text-teal-800 transition-all duration-200"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
