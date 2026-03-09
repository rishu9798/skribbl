export default function WordHint({ hint, currentWord }) {
  if (!hint && !currentWord) return null;

  // Drawer sees the actual word, guessers see the hint
  const display = currentWord || hint || '';

  return (
    <div style={{ textAlign:'center' }}>
      {currentWord ? (
        <div>
          <div style={{ fontSize:'0.7rem', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'2px' }}>
            Draw this word:
          </div>
          <div style={{
            fontFamily:"'Fredoka One', cursive", fontSize:'1.6rem', color:'var(--primary)',
            background:'#eff1fe', padding:'4px 16px', borderRadius:'8px',
          }}>
            {currentWord}
          </div>
        </div>
      ) : (
        <div>
          <div style={{ fontSize:'0.7rem', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'2px' }}>
            Guess the word:
          </div>
          <div style={{ display:'flex', gap:'4px', justifyContent:'center', alignItems:'flex-end' }}>
            {display.split('').map((ch, i) => (
              <span
                key={i}
                style={{
                  display:'inline-block',
                  minWidth: ch === '_' ? '18px' : 'auto',
                  padding: ch !== ' ' ? '2px 3px' : '0',
                  borderBottom: ch === '_' ? '2.5px solid var(--text)' : 'none',
                  fontFamily:"'Fredoka One', cursive",
                  fontSize: ch === '_' ? '1.5rem' : '1.3rem',
                  fontWeight:700,
                  color: ch !== '_' && ch !== ' ' ? 'var(--primary)' : 'transparent',
                  lineHeight:'1.2',
                }}
              >
                {ch === '_' ? ' ' : ch}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
