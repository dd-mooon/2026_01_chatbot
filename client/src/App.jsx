import { useState, useRef, useEffect } from 'react'

// 개발 시 Vite 프록시 사용(localhost:5173 → 3001), 배포 시 VITE_API_URL 지정
const API_BASE = import.meta.env.VITE_API_URL || ''

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
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* 헤더 */}
      <header className="bg-indigo-600 text-white px-4 py-3 shadow">
        <h1 className="text-lg font-semibold">코니 (Connie)</h1>
        <p className="text-sm text-indigo-100">사내 지식 가이드 챗봇</p>
      </header>

      {/* 메시지 목록 */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-slate-500 py-8">
            <p className="mb-4">궁금한 것을 물어보세요.</p>
            <p className="text-sm mb-4">자주 묻는 질문:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {FAQ_CHIPS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => sendMessage(q)}
                  className="px-3 py-2 rounded-full bg-white border border-slate-200 text-sm hover:bg-indigo-50 hover:border-indigo-200 transition"
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
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-md'
                  : 'bg-white border border-slate-200 rounded-bl-md shadow-sm'
              }`}
            >
              <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
              {msg.disclaimer && (
                <p className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1.5">
                  {msg.disclaimer}
                </p>
              )}
              {msg.role === 'assistant' && msg.type && (
                <p className="mt-2 text-xs text-slate-500 border-t border-slate-100 pt-2">
                  {msg.type === 'no_match' && msg.ollamaFailed
                    ? '⚠️ 등록된 정보 없음 (Ollama 미연결로 기본 안내만 표시됨)'
                    : msg.type === 'no_match' && msg.generalKnowledge
                      ? ANSWER_SOURCE_LABEL.no_match_general
                      : ANSWER_SOURCE_LABEL[msg.type]}
                </p>
              )}
              {msg.ollamaFailed && (
                <p className="mt-1 text-xs text-amber-600">⚠️ Ollama 연결 실패. 기본 안내만 표시됨. (서버 로그 또는 GET /api/ollama-status 확인)</p>
              )}
              {msg.refLink && (
                <a
                  href={msg.refLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-xs text-indigo-600 hover:underline"
                >
                  관련 링크 보기 →
                </a>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-md px-4 py-2 shadow-sm">
              <span className="text-slate-400 text-sm">답변 생성 중...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {error && (
        <div className="mx-4 mb-2 px-3 py-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* 입력 영역 */}
      <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-slate-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="질문을 입력하세요"
            className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            전송
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {FAQ_CHIPS.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => sendMessage(q)}
              className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs hover:bg-slate-200 transition"
            >
              {q}
            </button>
          ))}
        </div>
      </form>
    </div>
  )
}

export default App
