/**
 * 채팅 메시지 말풍선
 */
import BotAvatar from '../BotAvatar';
import { ANSWER_SOURCE_LABEL } from '../config/constants.js';

export default function ChatMessage({ msg }) {
  const isUser = msg.role === 'user';
  const isAssistant = msg.role === 'assistant';

  return (
    <div className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {isAssistant && <BotAvatar size={36} className="mb-1" />}
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3.5 shadow-sm ${
          isUser ? 'bg-teal-600 text-white rounded-br-md' : 'bg-white border border-slate-200/80 rounded-bl-md'
        }`}
      >
        <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{msg.content}</p>
        {msg.disclaimer && (
          <p className="mt-3 text-xs text-amber-800 bg-amber-50/90 border border-amber-200/80 rounded-lg px-3 py-2">
            {msg.disclaimer}
          </p>
        )}
        {isAssistant && msg.type && (
          <p className="mt-3 text-[11px] text-slate-400 border-t border-slate-100 pt-2">
            {msg.type === 'no_match' && msg.ollamaFailed
              ? '⚠️ 등록된 정보 없음 (Ollama 미연결로 기본 안내만 표시됨)'
              : msg.type === 'no_match' && msg.generalKnowledge
                ? ANSWER_SOURCE_LABEL.no_match_general
                : ANSWER_SOURCE_LABEL[msg.type]}
          </p>
        )}
        {msg.ollamaFailed && (
          <p className="mt-2 text-[11px] text-amber-600">⚠️ Ollama 연결 실패. 기본 안내만 표시됨.</p>
        )}
        {((msg.refLink && msg.refLink.trim()) || msg.attachmentUrl) && (
          <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
            {msg.refLink && msg.refLink.trim() && (
              <a
                href={msg.refLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-slate-50 hover:bg-teal-50 border border-slate-200/80 hover:border-teal-200 text-slate-700 hover:text-teal-800 transition-colors"
              >
                <span className="shrink-0 w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center text-teal-600 text-sm">→</span>
                <span className="flex-1 min-w-0 text-left font-medium">관련 링크 보기</span>
              </a>
            )}
            {msg.attachmentUrl && (
              <a
                href={msg.attachmentUrl}
                target="_blank"
                rel="noopener noreferrer"
                download={msg.attachmentName || undefined}
                className="inline-flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-slate-50 hover:bg-teal-50 border border-slate-200/80 hover:border-teal-200 text-slate-700 hover:text-teal-800 transition-colors"
              >
                <span className="shrink-0 w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center text-teal-600 text-sm">📎</span>
                <span className="flex-1 min-w-0 text-left font-medium truncate">{msg.attachmentName || '첨부파일'}</span>
                <span className="shrink-0 text-xs text-teal-600">다운로드</span>
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
