/**
 * 로딩 인디케이터
 */
import BotAvatar from '../BotAvatar';

export default function LoadingSpinner() {
  return (
    <div className="flex items-start gap-2.5 justify-start">
      <BotAvatar size={34} className="shrink-0 mt-0.5" />
      <div className="bg-white border border-slate-200/90 rounded-2xl rounded-bl-md px-3.5 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <span className="inline-flex gap-1.5 items-center">
          <span className="w-1.5 h-1.5 rounded-full bg-[#006666] animate-bounce [animation-delay:-0.3s]" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#006666] animate-bounce [animation-delay:-0.15s]" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#006666] animate-bounce" />
        </span>
      </div>
    </div>
  );
}
