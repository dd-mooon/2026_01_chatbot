/**
 * 로딩 인디케이터
 */
import BotAvatar from '../BotAvatar';

export default function LoadingSpinner() {
  return (
    <div className="flex items-start gap-2 justify-start">
      <BotAvatar size={36} className="mb-1" />
      <div className="bg-white border border-slate-200/80 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
        <span className="inline-flex gap-1">
          <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.15s]" />
          <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" />
        </span>
      </div>
    </div>
  );
}
