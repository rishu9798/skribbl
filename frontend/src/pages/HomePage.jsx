import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function HomePage() {
  const { user, guestLogin } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const handleGuest = async (e) => {
    e.preventDefault();
    if (!username.trim() || username.length < 2) {
      return setError('Username must be at least 2 characters');
    }
    setLoading(true);
    try {
      await guestLogin(username.trim());
      navigate('/lobby');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    page:     { minHeight: '100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding: '2rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    hero:     { textAlign:'center', color:'white', marginBottom: '2.5rem' },
    title:    { fontFamily: "'Fredoka One', cursive", fontSize:'4rem', letterSpacing:'2px', textShadow: '0 4px 16px rgba(0,0,0,0.2)', marginBottom:'0.5rem' },
    subtitle: { fontSize:'1.2rem', opacity:0.9 },
    card:     { background:'white', borderRadius:'20px', padding:'2rem', width:'100%', maxWidth:'400px', boxShadow:'0 20px 60px rgba(0,0,0,0.2)' },
    form:     { display:'flex', flexDirection:'column', gap:'1rem' },
    label:    { fontWeight:700, fontSize:'0.9rem', color:'#374151', marginBottom:'4px', display:'block' },
    input:    { padding:'12px 16px', borderRadius:'10px', border:'2px solid #e5e7eb', fontSize:'1rem', transition:'border-color 0.2s' },
    error:    { color:'#ef4444', fontSize:'0.85rem', fontWeight:600 },
    divider:  { display:'flex', alignItems:'center', gap:'1rem', color:'#9ca3af', fontSize:'0.85rem' },
    line:     { flex:1, height:'1px', background:'#e5e7eb' },
    features: { display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'1rem', marginTop:'3rem', maxWidth:'600px' },
    feat:     { background:'rgba(255,255,255,0.15)', borderRadius:'12px', padding:'1rem', textAlign:'center', color:'white' },
    featIcon: { fontSize:'2rem', marginBottom:'0.5rem' },
    featText: { fontSize:'0.85rem', opacity:0.9, fontWeight:600 },
  };

  return (
    <div style={styles.page}>
      <div style={styles.hero}>
        <h1 style={styles.title}>🎨 Skribbl</h1>
        <p style={styles.subtitle}>Draw. Guess. Laugh. Repeat.</p>
      </div>

      <div style={styles.card}>
        {user ? (
          <div style={{ textAlign:'center' }}>
            <p style={{ marginBottom:'1rem', color:'#6b7280' }}>Welcome back, <strong>{user.username}</strong>!</p>
            <button className="btn btn-primary btn-lg" style={{ width:'100%' }} onClick={() => navigate('/lobby')}>
              🎮 Play Now
            </button>
          </div>
        ) : (
          <form style={styles.form} onSubmit={handleGuest}>
            <div>
              <label style={styles.label}>Your Nickname</label>
              <input
                style={styles.input}
                placeholder="Enter a fun nickname..."
                value={username}
                onChange={e => { setUsername(e.target.value); setError(''); }}
                maxLength={20}
                autoFocus
              />
            </div>
            {error && <p style={styles.error}>⚠️ {error}</p>}
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? 'Loading...' : '🚀 Play as Guest'}
            </button>

            <div style={styles.divider}>
              <span style={styles.line} />
              or
              <span style={styles.line} />
            </div>

            <button type="button" className="btn btn-ghost" onClick={() => navigate('/login')}>
              Login / Create Account
            </button>
          </form>
        )}
      </div>

      <div style={styles.features}>
        {[
          { icon: '🖌️', text: 'Draw anything!' },
          { icon: '🧠', text: 'Guess fast for more points' },
          { icon: '👥', text: 'Up to 12 players' },
        ].map(f => (
          <div key={f.text} style={styles.feat}>
            <div style={styles.featIcon}>{f.icon}</div>
            <div style={styles.featText}>{f.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
