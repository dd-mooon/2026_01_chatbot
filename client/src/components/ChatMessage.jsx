/**
 * 채팅 메시지 말풍선 - Microsoft Teams 스타일
 */
import BotAvatar from '../BotAvatar';
import { ANSWER_SOURCE_LABEL } from '../config/constants.js';
import { formatMessageTime } from '../utils/formatTime.js';

export default function ChatMessage({ msg }) {
  const isUser = msg.role === 'user';
  const isAssistant = msg.role === 'assistant';

  return (
    <div className={`flex items-start gap-2 ${isUser ? 'justify-end' : 'justify-start'} py-1`}>
      {isAssistant && <BotAvatar size={28} className="mt-0.5 shrink-0" />}
      <div className={`max-w-[82%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        {isAssistant && (
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[12px] font-semibold text-[#6264a7]">코니</span>
            {msg.timestamp && (
              <span className="text-[11px] text-[#8a8886]">{formatMessageTime(msg.timestamp)}</span>
            )}
          </div>
        )}
        <div
          className={`rounded-lg px-3 py-2 ${
            isUser
              ? 'bg-[#e8e8f7] text-[#252423] rounded-br-[4px]'
              : 'bg-white text-[#252423] rounded-bl-[4px] border border-[#edebe9]'
          }`}
        >
          <p className="whitespace-pre-wrap text-[14px] leading-[1.4]">{msg.content}</p>
          {isUser && msg.timestamp && (
            <p className="text-[11px] text-[#8a8886] mt-1 text-right">{formatMessageTime(msg.timestamp)}</p>
          )}
        {msg.disclaimer && (
          <p className="mt-3 text-xs text-amber-800 bg-amber-50/90 border border-amber-200/80 rounded px-3 py-2">
            {msg.disclaimer}
          </p>
        )}
        {isAssistant && msg.type && (
          <p className="mt-3 text-[11px] text-[#605e5c] border-t border-[#edebe9] pt-2">
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
          <div className="mt-3 pt-3 border-t border-[#edebe9] space-y-2">
            {msg.refLink && msg.refLink.trim() && (
              <a
                href={msg.refLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 w-full px-3 py-2 rounded bg-[#faf9f8] hover:bg-[#e8e8f7] border border-[#edebe9] text-[#252423] hover:text-[#6264a7] transition-colors"
              >
                <span className="shrink-0 w-7 h-7 rounded bg-[#e8e8f7] flex items-center justify-center text-[#6264a7] text-xs">→</span>
                <span className="flex-1 min-w-0 text-left font-medium text-sm">관련 링크 보기</span>
              </a>
            )}
            {msg.attachmentUrl && (
              <a
                href={msg.attachmentUrl}
                target="_blank"
                rel="noopener noreferrer"
                download={msg.attachmentName || undefined}
                className="inline-flex items-center gap-2 w-full px-3 py-2 rounded bg-[#faf9f8] hover:bg-[#e8e8f7] border border-[#edebe9] text-[#252423] hover:text-[#6264a7] transition-colors"
              >
                <span className="shrink-0 w-7 h-7 rounded bg-[#e8e8f7] flex items-center justify-center text-[#6264a7] text-xs">📎</span>
                <span className="flex-1 min-w-0 text-left font-medium text-sm truncate">{msg.attachmentName || '첨부파일'}</span>
                <span className="shrink-0 text-xs text-[#6264a7]">다운로드</span>
              </a>
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
