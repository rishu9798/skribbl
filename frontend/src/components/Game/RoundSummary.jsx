export default function RoundSummary({ result }) {
  const { word, players } = result;
  const medals = ['🥇','🥈','🥉'];

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 }}>
      <div style={{ background:'white', borderRadius:'20px', padding:'2rem', minWidth:'320px', textAlign:'center', animation:'bounceIn 0.35s ease' }}>
        <div style={{ fontSize:'2rem', marginBottom:'0.5rem' }}>✨</div>
        <h2 style={{ fontFamily:"'Fredoka One', cursive", fontSize:'1.6rem', color:'var(--primary)', marginBottom:'0.5rem' }}>
          Round Over!
        </h2>
        <div style={{ background:'var(--bg)', borderRadius:'10px', padding:'10px 20px', marginBottom:'1rem', display:'inline-block' }}>
          <span style={{ color:'var(--text-muted)', fontSize:'0.85rem' }}>The word was: </span>
          <strong style={{ fontFamily:"'Fredoka One', cursive", fontSize:'1.2rem', color:'var(--text)' }}>
            {word}
          </strong>
        </div>
        <div style={{ textAlign:'left' }}>
          {players?.slice(0, 5).map((p, i) => (
            <div key={p.socketId || i} style={{ display:'flex', justifyContent:'space-between', padding:'8px 12px', borderRadius:'8px', background: i===0 ? '#fef9c3' : 'var(--bg)', marginBottom:'6px' }}>
              <span style={{ fontWeight:700 }}>{medals[i] || `${i+1}.`} {p.username}</span>
              <span style={{ fontWeight:800, color:'var(--primary)' }}>{p.score} pts</span>
            </div>
          ))}
        </div>
        <p style={{ color:'var(--text-muted)', fontSize:'0.85rem', marginTop:'1rem' }}>Next round starting shortly...</p>
      </div>
    </div>
  );
}
