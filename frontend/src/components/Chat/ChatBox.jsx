import { useState, useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';

export default function ChatBox({ messages, onSend, isDrawer, gameStatus }) {
  const [input,   setInput]   = useState('');
  const bottomRef             = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSend(input.trim());
    setInput('');
  };

  const placeholder = isDrawer
    ? 'You\'re drawing! No cheating 😄'
    : gameStatus === 'drawing'
      ? 'Type your guess...'
      : 'Chat here...';

  return (
    <div style={{ display:'flex', flexDirection:'column', flex:1, overflow:'hidden' }}>
      {/* Messages */}
      <div style={{ flex:1, overflowY:'auto', padding:'8px 12px', display:'flex', flexDirection:'column', gap:'4px' }}>
        {messages.length === 0 && (
          <p style={{ color:'var(--text-muted)', fontSize:'0.85rem', textAlign:'center', marginTop:'1rem' }}>
            No messages yet...
          </p>
        )}
        {messages.map((msg, i) => (
          <ChatMessage key={i} message={msg} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        style={{ display:'flex', gap:'6px', padding:'10px 12px', borderTop:'1px solid var(--border)', flexShrink:0 }}
      >
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={placeholder}
          disabled={isDrawer && gameStatus === 'drawing'}
          maxLength={200}
          style={{ flex:1, padding:'8px 12px', borderRadius:'8px', fontSize:'0.9rem' }}
        />
        <button
          type="submit"
          className="btn btn-primary"
          style={{ padding:'8px 14px', fontSize:'0.85rem', flexShrink:0 }}
          disabled={!input.trim() || (isDrawer && gameStatus === 'drawing')}
        >
          Send
        </button>
      </form>
    </div>
  );
}
