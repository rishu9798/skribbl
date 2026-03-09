export default function Scoreboard({ players, currentDrawerSocketId, mySocketId }) {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div>
      <h3 style={{ fontFamily:"'Fredoka One', cursive", fontSize:'1.1rem', color:'var(--primary)', marginBottom:'0.75rem' }}>
        🏆 Scores
      </h3>
      {sorted.map((player, i) => {
        const isMe     = player.socketId === mySocketId;
        const isDrawer = player.socketId === currentDrawerSocketId;

        return (
          <div
            key={player.socketId || player.id || player.username}
            style={{
              display:'flex', alignItems:'center', justifyContent:'space-between',
              padding:'8px 10px', borderRadius:'10px', marginBottom:'6px',
              background: isMe ? '#eff1fe' : 'var(--bg)',
              border: isMe ? '1px solid var(--primary)' : '1px solid var(--border)',
            }}
          >
            <div style={{ display:'flex', alignItems:'center', gap:'6px', overflow:'hidden' }}>
              <span style={{ fontSize:'1rem', flexShrink:0 }}>{medals[i] || `${i+1}.`}</span>
              <div>
                <div style={{ fontWeight:700, fontSize:'0.85rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'110px' }}>
                  {player.username}{isMe ? ' (you)' : ''}
                </div>
                <div style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>
                  {isDrawer ? '✏️ Drawing' : player.hasGuessedThisTurn ? '✅ Guessed' : '👀 Watching'}
                </div>
              </div>
            </div>
            <span style={{ fontWeight:800, color:'var(--primary)', fontSize:'0.9rem', flexShrink:0 }}>
              {player.score}
            </span>
          </div>
        );
      })}
    </div>
  );
}
