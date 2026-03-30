import { useRef, useEffect } from 'react';
import { useChat } from './hooks/useChat.js';
import { useFaq } from './hooks/useFaq.js';
import ChatHeader from './components/ChatHeader';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import EmptyState from './components/EmptyState';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const { messages, loading, error, sendMessage } = useChat();
  const faqChips = useFaq();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="min-h-screen flex flex-col bg-[#eef2f6]">
      <ChatHeader />

      <main className="flex-1 min-h-0 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 sm:px-5 py-5 space-y-3 min-h-full">
          {messages.length === 0 && <EmptyState />}
          {messages.map((msg, i) => (
            <ChatMessage key={i} msg={msg} />
          ))}
          {loading && <LoadingSpinner />}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {error && (
        <div className="shrink-0 mx-4 mb-2 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
          {error}
        </div>
      )}

      <ChatInput onSendMessage={sendMessage} loading={loading} faqChips={faqChips} />
    </div>
  );
}

export default App;
