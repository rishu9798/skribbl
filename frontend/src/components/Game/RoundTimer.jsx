export default function RoundTimer({ timeLeft, drawTime }) {
  const fraction = timeLeft / drawTime;
  const color = fraction > 0.5 ? '#22c55e' : fraction > 0.25 ? '#f59e0b' : '#ef4444';
  const radius = 16;
  const circ   = 2 * Math.PI * radius;
  const dash   = circ * fraction;

  return (
    <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
      <svg width="40" height="40" viewBox="0 0 40 40">
        <circle cx="20" cy="20" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="3" />
        <circle
          cx="20" cy="20" r={radius}
          fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 20 20)"
          style={{ transition: 'stroke-dasharray 0.5s linear, stroke 0.5s' }}
        />
        <text x="20" y="20" textAnchor="middle" dominantBaseline="central" style={{ fontFamily:"'Fredoka One', cursive", fontSize:'11px', fill: color, fontWeight:700 }}>
          {timeLeft}
        </text>
      </svg>
    </div>
  );
}
