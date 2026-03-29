/**
 * 채팅 헤더
 */
import BotAvatar from '../BotAvatar';
import { COMPANY_SITE } from '../config/constants.js';

export default function ChatHeader() {
  return (
    <header className="shrink-0 bg-[#faf9f8] border-b border-[#edebe9]">
      <div className="max-w-2xl mx-auto px-4 py-2.5">
        <div className="flex items-center justify-between">
          <a
            href={COMPANY_SITE}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-[#252423] hover:text-[#6264a7] transition-colors"
            aria-label="콘센트릭스 Catalyst 코리아"
          >
            <img src="/logo.svg" alt="Concentrix Catalyst" className="h-6 w-auto" />
          </a>
          <div className="flex items-center gap-2.5 min-w-0 pl-3 border-l border-[#edebe9]">
            <BotAvatar size={32} />
            <div className="min-w-0">
              <h1 className="text-[14px] font-semibold text-[#252423] truncate leading-tight">코니</h1>
              <p className="text-[11px] text-[#605e5c] leading-tight">사내 지식 가이드봇</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
