/**
 * 로딩 인디케이터
 */
import BotAvatar from '../BotAvatar';

export default function LoadingSpinner() {
  return (
    <div className="flex items-start gap-2 justify-start py-1">
      <BotAvatar size={28} className="mt-0.5 shrink-0" />
      <div className="bg-white border border-[#edebe9] rounded-lg rounded-bl-[4px] px-3 py-2">
        <span className="inline-flex gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#6264a7] animate-bounce [animation-delay:-0.3s]" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#6264a7] animate-bounce [animation-delay:-0.15s]" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#6264a7] animate-bounce" />
        </span>
      </div>
    </div>
  );
}
