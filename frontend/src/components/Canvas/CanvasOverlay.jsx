export default function CanvasOverlay({ gameStatus, isDrawer }) {
  if (gameStatus === 'drawing') return null;

  const s = {
    overlay: { position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(255,255,255,0.85)', backdropFilter:'blur(4px)', borderRadius:'10px' },
    content: { textAlign:'center' },
    icon:    { fontSize:'3rem', marginBottom:'0.5rem' },
    title:   { fontFamily:"'Fredoka One', cursive", fontSize:'1.8rem', color:'var(--primary)', marginBottom:'0.25rem' },
    sub:     { color:'var(--text-muted)', fontSize:'1rem' },
  };

  const messages = {
    waiting:  { icon:'⏳', title:'Waiting for players...', sub:'The host will start soon' },
    choosing: { icon:'🤔', title: isDrawer ? 'Pick a word!' : 'Waiting for drawer...', sub: isDrawer ? 'Choose from the options above' : 'The drawer is picking a word' },
    summary:  { icon:'✨', title:'Round ended!', sub:'Next round starting soon...' },
    ended:    { icon:'🏆', title:'Game Over!', sub:'' },
  };

  const msg = messages[gameStatus];
  if (!msg) return null;

  return (
    <div style={s.overlay}>
      <div style={s.content}>
        <div style={s.icon}>{msg.icon}</div>
        <h2 style={s.title}>{msg.title}</h2>
        <p style={s.sub}>{msg.sub}</p>
      </div>
    </div>
  );
}
