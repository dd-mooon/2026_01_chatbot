/**
 * 채팅 메시지 — 코니 HR 어시스턴트 스타일
 */
import BotAvatar from '../BotAvatar';
import UserAvatar from './UserAvatar';
import { ANSWER_SOURCE_LABEL } from '../config/constants.js';
import { formatMetaTime } from '../utils/formatTime.js';

const AVATAR_ACTIVE_MS = 1000;

export default function ChatMessage({ msg }) {
  const isUser = msg.role === 'user';
  const isAssistant = msg.role === 'assistant';
  const metaTime = msg.timestamp ? formatMetaTime(msg.timestamp) : '';

  return (
    <div
      className={`flex w-full min-w-0 items-start gap-2 sm:gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {isAssistant && (
        <BotAvatar
          key={msg.timestamp}
          size={34}
          className="shrink-0 mt-0.5"
          pulseMs={AVATAR_ACTIVE_MS}
        />
      )}
      <div
        className={`min-w-0 max-w-[min(20rem,calc(100%-2.75rem))] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
      >
        <div
          className={`w-full max-w-full rounded-2xl px-3.5 py-2.5 ${
            isUser
              ? 'bg-[#006666] text-white rounded-br-md shadow-sm'
              : 'bg-white text-[#1e293b] rounded-bl-md border border-slate-200/90 shadow-[0_1px_2px_rgba(15,23,42,0.04)]'
          }`}
        >
          <p
            className={`whitespace-pre-wrap break-words text-[14px] leading-[1.5] ${isUser ? 'text-white' : 'text-slate-800'}`}
          >
            {msg.content}
          </p>
          {msg.disclaimer && (
            <p
              className={`mt-3 text-xs rounded-lg px-3 py-2 border ${
                isUser
                  ? 'text-amber-50 bg-white/12 border-white/25'
                  : 'text-amber-900 bg-amber-50/95 border-amber-200/80'
              }`}
            >
              {msg.disclaimer}
            </p>
          )}
          {isAssistant && msg.type === 'rag' && msg.sources?.length > 0 && (
            <details className="mt-3 rounded-lg border border-slate-200/90 bg-slate-50/80 open:bg-slate-50">
              <summary className="cursor-pointer list-none px-3 py-2 text-[12px] font-medium text-[#006666] [&::-webkit-details-marker]:hidden">
                참고한 사내 문단 ({msg.sources.length}개)
              </summary>
              <ul className="max-h-44 overflow-y-auto border-t border-slate-200/80 px-3 py-2 space-y-2.5 text-[11px] leading-snug text-slate-600">
                {msg.sources.map((s, i) => (
                  <li key={i} className="pl-2.5 border-l-2 border-[#006666]/25">
                    <p className="whitespace-pre-wrap break-words">{s.text || ''}</p>
                    {(s.metadata?.source || s.metadata?.refLink) && (
                      <p className="mt-1 text-[10px] text-slate-400 truncate">
                        {s.metadata.source}
                        {s.metadata.source && s.metadata.refLink ? ' · ' : ''}
                        {s.metadata.refLink}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </details>
          )}
          {isAssistant && msg.type && (
            <p className="mt-3 text-[11px] text-slate-500 border-t border-slate-100 pt-2.5">
              {msg.type === 'no_match' && msg.ollamaFailed
                ? '⚠️ 등록된 정보 없음 (Ollama 미연결로 기본 안내만 표시됨)'
                : msg.type === 'no_match' && msg.generalKnowledge
                  ? ANSWER_SOURCE_LABEL.no_match_general
                  : ANSWER_SOURCE_LABEL[msg.type]}
            </p>
          )}
          {msg.ollamaFailed && (
            <p className="mt-2 text-[11px] text-amber-700">⚠️ Ollama 연결 실패. 기본 안내만 표시됨.</p>
          )}
          {((msg.refLink && msg.refLink.trim()) || msg.attachmentUrl) && (
            <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
              {msg.refLink && msg.refLink.trim() && (
                <a
                  href={msg.refLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 w-full px-3 py-2 rounded-xl bg-slate-50 hover:bg-[#e8f4f4] border border-slate-200/80 text-[#0f172a] hover:text-[#006666] transition-colors text-sm font-medium"
                >
                  <span className="shrink-0 w-7 h-7 rounded-lg bg-[#006666]/10 flex items-center justify-center text-[#006666] text-xs">→</span>
                  <span className="flex-1 min-w-0 text-left">관련 링크 보기</span>
                </a>
              )}
              {msg.attachmentUrl && (
                <a
                  href={msg.attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={msg.attachmentName || undefined}
                  className="inline-flex items-center gap-2 w-full px-3 py-2 rounded-xl bg-slate-50 hover:bg-[#e8f4f4] border border-slate-200/80 text-[#0f172a] hover:text-[#006666] transition-colors text-sm font-medium"
                >
                  <span className="shrink-0 w-7 h-7 rounded-lg bg-[#006666]/10 flex items-center justify-center text-[#006666] text-xs">📎</span>
                  <span className="flex-1 min-w-0 text-left truncate">{msg.attachmentName || '첨부파일'}</span>
                  <span className="shrink-0 text-xs text-[#006666]">다운로드</span>
                </a>
              )}
            </div>
          )}
        </div>
        {metaTime && (
          <p className={`text-[11px] text-slate-400 mt-1.5 ${isUser ? 'text-right pr-0.5' : 'pl-0.5'}`}>
            {isAssistant ? `코니 · ${metaTime}` : `나 · ${metaTime}`}
          </p>
        )}
      </div>
      {isUser && <UserAvatar size={34} className="shrink-0 mt-0.5" />}
    </div>
  );
}
