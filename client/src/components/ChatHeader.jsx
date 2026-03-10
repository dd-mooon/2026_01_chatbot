/**
 * 채팅 헤더
 */
import BotAvatar from '../BotAvatar';
import { COMPANY_SITE } from '../config/constants.js';

export default function ChatHeader() {
  return (
    <header className="shrink-0 bg-white border-b border-slate-200/80 shadow-sm">
      <div className="max-w-2xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <a
            href={COMPANY_SITE}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-slate-700 hover:text-teal-600 transition-colors"
            aria-label="콘센트릭스 Catalyst 코리아"
          >
            <img src="/logo.svg" alt="Concentrix Catalyst" className="h-7 w-auto" />
          </a>
          <div className="flex items-center gap-2.5 min-w-0">
            <BotAvatar size={32} />
            <div className="min-w-0">
              <h1 className="text-base font-bold text-slate-800 truncate">코니</h1>
              <p className="text-[11px] text-slate-500 font-medium">사내 지식 가이드봇</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
