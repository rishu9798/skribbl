import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
  const [mode,     setMode]     = useState('login'); // 'login' | 'signup'
  const [form,     setForm]     = useState({ username:'', email:'', password:'' });
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const update = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await signup(form.username, form.email, form.password);
      }
      navigate('/lobby');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const s = {
    page:  { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding:'1rem' },
    card:  { background:'white', borderRadius:'20px', padding:'2.5rem', width:'100%', maxWidth:'420px', boxShadow:'0 20px 60px rgba(0,0,0,0.25)' },
    title: { fontFamily:"'Fredoka One', cursive", fontSize:'2rem', textAlign:'center', marginBottom:'1.5rem', color:'#5c6ef8' },
    tabs:  { display:'flex', background:'#f3f4f6', borderRadius:'10px', padding:'4px', marginBottom:'1.5rem' },
    tab:   (active) => ({ flex:1, padding:'10px', border:'none', borderRadius:'8px', fontWeight:700, cursor:'pointer', transition:'all 0.2s', background: active ? 'white' : 'transparent', color: active ? '#5c6ef8' : '#6b7280', boxShadow: active ? '0 2px 8px rgba(0,0,0,0.1)' : 'none' }),
    field: { marginBottom:'1rem' },
    label: { display:'block', fontWeight:700, fontSize:'0.85rem', color:'#374151', marginBottom:'6px' },
    error: { color:'#ef4444', fontSize:'0.85rem', fontWeight:600, margin:'0.5rem 0' },
    back:  { display:'block', textAlign:'center', marginTop:'1rem', color:'#6b7280', fontSize:'0.9rem', textDecoration:'none' },
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <h1 style={s.title}>🎨 Skribbl</h1>

        <div style={s.tabs}>
          <button style={s.tab(mode==='login')}  onClick={() => setMode('login')}>Login</button>
          <button style={s.tab(mode==='signup')} onClick={() => setMode('signup')}>Sign Up</button>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div style={s.field}>
              <label style={s.label}>Username</label>
              <input placeholder="coolplayer42" value={form.username} onChange={update('username')} required minLength={2} maxLength={20} />
            </div>
          )}
          <div style={s.field}>
            <label style={s.label}>Email</label>
            <input type="email" placeholder="you@example.com" value={form.email} onChange={update('email')} required />
          </div>
          <div style={s.field}>
            <label style={s.label}>Password</label>
            <input type="password" placeholder="••••••••" value={form.password} onChange={update('password')} required minLength={6} />
          </div>

          {error && <p style={s.error}>⚠️ {error}</p>}

          <button type="submit" className="btn btn-primary" style={{ width:'100%', marginTop:'0.5rem' }} disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? '🔐 Login' : '🎉 Create Account'}
          </button>
        </form>

        <Link to="/" style={s.back}>← Back to home</Link>
      </div>
    </div>
  );
}
