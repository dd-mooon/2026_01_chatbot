/**
 * 상단 영역 — 로고 + 채팅방 위 코니 프로필 (한 덩어리 카드)
 */
import BotAvatar from '../BotAvatar';
import { COMPANY_SITE } from '../config/constants.js';

export default function ChatHeader() {
  return (
    <header className="shrink-0 bg-white border-b border-slate-200/90 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="max-w-2xl mx-auto px-4 sm:px-5">
        <div className="pt-3 pb-2">
          <a
            href={COMPANY_SITE}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[#0f172a] hover:text-[#006666] transition-colors"
            aria-label="콘센트릭스 Catalyst 코리아"
          >
            <img alt="Concentrix Catalyst" className="h-6 w-auto" src="/logo.svg" />
          </a>
        </div>

        <div className="flex items-center gap-3 pb-3 pt-2 border-t border-slate-100">
          <BotAvatar size={40} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-[16px] font-semibold text-[#0f172a] tracking-tight">코니</h1>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e8f4f4] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#006666]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#006666]" aria-hidden />
                Online
              </span>
            </div>
            <p className="text-[12px] text-[#64748b] mt-0.5 leading-snug">사내 지식 가이드봇</p>
          </div>
        </div>
      </div>
    </header>
  );
}
