export default function WordPicker({ words, onPick }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 }}>
      <div style={{ background:'white', borderRadius:'20px', padding:'2rem', textAlign:'center', minWidth:'340px', animation:'bounceIn 0.35s ease' }}>
        <div style={{ fontSize:'2.5rem', marginBottom:'0.5rem' }}>🤔</div>
        <h2 style={{ fontFamily:"'Fredoka One', cursive", fontSize:'1.8rem', color:'var(--primary)', marginBottom:'0.25rem' }}>
          Your turn to draw!
        </h2>
        <p style={{ color:'var(--text-muted)', marginBottom:'1.5rem', fontSize:'0.95rem' }}>
          Pick a word to draw (others are trying to guess)
        </p>
        <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
          {words.map((word, i) => (
            <button
              key={word}
              className="btn btn-primary"
              style={{ fontSize:'1.2rem', padding:'14px 24px', borderRadius:'12px', fontFamily:"'Fredoka One', cursive", letterSpacing:'1px' }}
              onClick={() => onPick(word)}
            >
              {word}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
