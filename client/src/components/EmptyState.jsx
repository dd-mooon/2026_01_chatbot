/**
 * 빈 화면 - 자주 묻는 질문 칩
 */
import BotAvatar from '../BotAvatar';

export default function EmptyState({ onSendMessage, faqChips = [] }) {
  return (
    <div className="text-center pt-16 pb-8">
      <div className="inline-block mb-5">
        <BotAvatar size={64} />
      </div>
      <p className="text-[#252423] font-semibold text-[15px] mb-0.5">무엇이든 물어보세요</p>
      <p className="text-[#605e5c] text-[13px] mb-5">사내 규정, 자리배치, 연차·회식 안내 등</p>
      <p className="text-[11px] text-[#8a8886] mb-2">자주 묻는 질문</p>
      <div className="flex flex-wrap gap-1.5 justify-center">
        {faqChips.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => onSendMessage(q)}
            className="px-3 py-2 rounded-md bg-white text-[#252423] text-[13px] font-medium border border-[#edebe9] hover:border-[#6264a7]/40 hover:bg-[#e8e8f7] hover:text-[#6264a7] transition-colors"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
