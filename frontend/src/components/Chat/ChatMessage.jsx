export default function ChatMessage({ message }) {
  const { type, username, message: text, timestamp } = message;

  const styles = {
    correct: { background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:'8px', padding:'6px 10px' },
    close:   { background:'#fff7ed', border:'1px solid #fed7aa', borderRadius:'8px', padding:'6px 10px' },
    system:  { textAlign:'center', color:'var(--text-muted)', fontSize:'0.8rem', padding:'2px 0' },
    chat:    { padding:'4px 0' },
  };

  const icons = { correct: '✅', close: '🔥', system: 'ℹ️' };

  if (type === 'system') {
    return <div style={styles.system}>{text}</div>;
  }

  return (
    <div style={styles[type] || styles.chat}>
      {type === 'correct' && (
        <span style={{ fontWeight: 800, color: '#16a34a', fontSize: '0.9rem' }}>
          ✅ {username} guessed it!
        </span>
      )}
      {type === 'close' && (
        <span style={{ fontWeight: 700, color: '#d97706', fontSize: '0.85rem' }}>
          🔥 {text}
        </span>
      )}
      {(type === 'chat' || !type) && (
        <span style={{ fontSize: '0.9rem' }}>
          <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{username}: </span>
          <span style={{ color: 'var(--text)' }}>{text}</span>
        </span>
      )}
    </div>
  );
}
