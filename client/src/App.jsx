import { useState, useRef, useEffect } from 'react'
import BotAvatar from './BotAvatar'

// 개발 시 Vite 프록시 사용(localhost:5173 → 3001), 배포 시 VITE_API_URL 지정
const API_BASE = import.meta.env.VITE_API_URL || ''
const COMPANY_SITE = 'https://kr.catalyst.concentrix.com/'

// 자주 묻는 질문 칩 (초기값 — 서버 지식에서 가져오거나 하드코딩)
const FAQ_CHIPS = [
  '건전지 어디 있어?',
  '회식 언제야?',
  '연차는 며칠이야?',
]

// 답변 출처 라벨 (type에 따라 표시)
const ANSWER_SOURCE_LABEL = {
  exact_match: '📋 어드민에 등록된 지식에서 찾은 답변',
  rag: '🤖 등록된 지식을 참고해 AI(Ollama)가 생성한 답변',
  no_match: '🤖 등록된 정보가 없어 AI(Ollama)가 안내한 메시지',
  no_match_general: '🤖 AI가 일반 지식으로 답변 (등록된 사내 지식 아님)',
}

function App() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  useEffect(scrollToBottom, [messages])

  const sendMessage = async (text) => {
    const question = (text || input).trim()
    if (!question) return

    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: question }])
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      })
      const data = await res.json()

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.error || data.detail || '오류가 발생했습니다.', refLink: null },
        ])
        return
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.answer,
          refLink: data.refLink || null,
          attachmentUrl: data.attachmentUrl || null,
          attachmentName: data.attachmentName || null,
          type: data.type,
          ollamaFailed: data.ollamaFailed ?? false,
          ollamaError: data.ollamaError || null,
          generalKnowledge: data.generalKnowledge ?? false,
          disclaimer: data.disclaimer || null,
        },
      ])
    } catch (err) {
      setError(err.message)
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해 주세요.', refLink: null },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    sendMessage()
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f1f5f9]">
      {/* 헤더 */}
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
              <img
                src="/logo.svg"
                alt="Concentrix Catalyst"
                className="h-7 w-auto"
              />
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

      {/* 메시지 영역 */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
          {messages.length === 0 && (
            <div className="text-center pt-12 pb-8">
              <div className="inline-block mb-6">
                <BotAvatar size={72} />
              </div>
              <p className="text-slate-600 font-medium text-lg mb-1">무엇이든 물어보세요</p>
              <p className="text-slate-500 text-sm mb-6">사내 규정, 자리배치, 연차·회식 안내 등</p>
              <p className="text-xs text-slate-400 mb-3">자주 묻는 질문</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {FAQ_CHIPS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => sendMessage(q)}
                    className="px-4 py-2.5 rounded-full bg-white text-slate-700 text-sm font-medium shadow-sm border border-slate-200/80 hover:border-teal-300 hover:bg-teal-50/80 hover:text-teal-800 transition-all duration-200"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && <BotAvatar size={36} className="mb-1" />}
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3.5 shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-teal-600 text-white rounded-br-md'
                    : 'bg-white border border-slate-200/80 rounded-bl-md'
                }`}
              >
                <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{msg.content}</p>
                {msg.disclaimer && (
                  <p className="mt-3 text-xs text-amber-800 bg-amber-50/90 border border-amber-200/80 rounded-lg px-3 py-2">
                    {msg.disclaimer}
                  </p>
                )}
                {msg.role === 'assistant' && msg.type && (
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
                {(msg.refLink || msg.attachmentUrl) && (
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                    {msg.refLink && (
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
          ))}
          {loading && (
            <div className="flex items-end gap-2 justify-start">
              <BotAvatar size={36} className="mb-1" />
              <div className="bg-white border border-slate-200/80 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                <span className="inline-flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" />
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {error && (
        <div className="shrink-0 mx-4 mb-2 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
          {error}
        </div>
      )}

      {/* 입력 영역 */}
      <form onSubmit={handleSubmit} className="shrink-0 bg-white border-t border-slate-200/80 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.08)]">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="질문을 입력하세요"
              className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-[15px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="shrink-0 px-5 py-3 rounded-xl bg-teal-600 text-white font-semibold text-sm hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
            >
              전송
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {FAQ_CHIPS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => sendMessage(q)}
                className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium hover:bg-slate-200 hover:text-slate-800 transition"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </form>
    </div>
  )
}

export default App
