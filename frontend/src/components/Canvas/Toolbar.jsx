import { PALETTE, BRUSH_SIZES } from '../../utils/constants';

export default function Toolbar({ color, setColor, size, setSize, tool, setTool, onClear }) {
  const s = {
    bar:     { display:'flex', alignItems:'center', gap:'12px', padding:'10px 16px', background:'white', borderRadius:'12px', border:'1px solid var(--border)', flexWrap:'wrap' },
    section: { display:'flex', alignItems:'center', gap:'6px' },
    divider: { width:'1px', height:'24px', background:'var(--border)' },
    toolBtn: (active) => ({
      width:'36px', height:'36px', border:'2px solid', borderColor: active ? 'var(--primary)' : 'var(--border)',
      borderRadius:'8px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
      fontSize:'1rem', background: active ? '#eff1fe' : 'white', transition:'all 0.15s',
    }),
    swatch: (c, active) => ({
      width: active ? '28px' : '24px', height: active ? '28px' : '24px',
      background: c, borderRadius:'50%', cursor:'pointer',
      border: active ? '3px solid #5c6ef8' : '2px solid rgba(0,0,0,0.1)',
      transition:'all 0.15s', flexShrink:0,
    }),
    sizeBtn:(s2, active) => ({
      width:`${s2 * 0.8 + 12}px`, height:`${s2 * 0.8 + 12}px`, minWidth:'18px', minHeight:'18px',
      borderRadius:'50%', background: active ? 'var(--primary)' : 'var(--border)',
      cursor:'pointer', border:'none', transition:'all 0.15s',
    }),
  };

  return (
    <div style={s.bar}>
      {/* Tools */}
      <div style={s.section}>
        <button title="Pen" style={s.toolBtn(tool==='pen')}    onClick={() => setTool('pen')}>✏️</button>
        <button title="Eraser" style={s.toolBtn(tool==='eraser')} onClick={() => setTool('eraser')}>🧹</button>
        <button title="Fill" style={s.toolBtn(tool==='fill')}  onClick={() => setTool('fill')}>🪣</button>
      </div>

      <div style={s.divider} />

      {/* Color palette */}
      <div style={{ ...s.section, flexWrap:'wrap', maxWidth:'200px' }}>
        {PALETTE.map(c => (
          <button key={c} style={s.swatch(c, color===c)} onClick={() => { setColor(c); setTool('pen'); }} title={c} />
        ))}
        {/* Custom color picker */}
        <input
          type="color"
          value={color}
          onChange={e => { setColor(e.target.value); setTool('pen'); }}
          title="Custom color"
          style={{ width:'24px', height:'24px', padding:'1px', border:'2px solid var(--border)', borderRadius:'50%', cursor:'pointer', background:'none' }}
        />
      </div>

      <div style={s.divider} />

      {/* Brush size */}
      <div style={s.section}>
        {BRUSH_SIZES.map(s2 => (
          <button key={s2} style={s.sizeBtn(s2, size===s2)} onClick={() => setSize(s2)} title={`${s2}px`} />
        ))}
      </div>

      <div style={s.divider} />

      {/* Clear */}
      <button className="btn btn-danger" style={{ padding:'6px 14px', fontSize:'0.85rem' }} onClick={onClear} title="Clear canvas">
        🗑️ Clear
      </button>
    </div>
  );
}
