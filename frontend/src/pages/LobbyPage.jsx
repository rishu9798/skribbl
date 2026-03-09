import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth }   from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import api from '../utils/api';

export default function LobbyPage() {
  const { user, token, logout } = useAuth();
  const { connect } = useSocket();
  const navigate = useNavigate();

  const [rooms,      setRooms]      = useState([]);
  const [joinCode,   setJoinCode]   = useState('');
  const [creating,   setCreating]   = useState(false);
  const [roomName,   setRoomName]   = useState('');
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');

  useEffect(() => {
    fetchRooms();
    const interval = setInterval(fetchRooms, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await api.get('/rooms');
      setRooms(res.data.rooms);
    } catch (_) {}
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/rooms', { name: roomName || undefined });
      const code = res.data.room.code;
      joinRoom(code);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const joinRoom = (code) => {
    // Ensure socket is connected before navigating
    const socket = connect(token || localStorage.getItem('token'), user.username);
    navigate(`/game/${code}`);
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    joinRoom(joinCode.trim().toUpperCase());
  };

  const s = {
    page:   { minHeight:'100vh', padding:'2rem', background:'var(--bg)' },
    header: { display:'flex', justifyContent:'space-between', alignItems:'center', maxWidth:'960px', margin:'0 auto 2rem', padding:'0 1rem' },
    title:  { fontFamily:"'Fredoka One', cursive", fontSize:'2rem', color:'var(--primary)' },
    grid:   { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem', maxWidth:'960px', margin:'0 auto', padding:'0 1rem' },
    card:   { background:'white', borderRadius:'16px', padding:'1.5rem', boxShadow:'var(--shadow-sm)', border:'1px solid var(--border)' },
    sTitle: { fontFamily:"'Fredoka One', cursive", fontSize:'1.4rem', color:'var(--text)', marginBottom:'1rem' },
    roomItem:{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 16px', border:'1px solid var(--border)', borderRadius:'10px', marginBottom:'8px' },
    badge:  (full) => ({ padding:'3px 10px', borderRadius:'20px', fontSize:'0.8rem', fontWeight:700, background: full ? '#fef2f2' : '#f0fdf4', color: full ? '#ef4444' : '#22c55e' }),
    error:  { color:'var(--danger)', fontSize:'0.85rem', fontWeight:600, margin:'0.5rem 0' },
  };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <h1 style={s.title}>🎨 Skribbl Lobby</h1>
        <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
          <span style={{ color:'var(--text-muted)', fontWeight:600 }}>👤 {user?.username}</span>
          <button className="btn btn-ghost" onClick={async () => { await logout(); navigate('/'); }}>Logout</button>
        </div>
      </div>

      <div style={s.grid}>
        {/* Left: Create & Join */}
        <div>
          {/* Quick Join */}
          <div style={{ ...s.card, marginBottom:'1.5rem' }}>
            <h2 style={s.sTitle}>🚪 Join by Code</h2>
            <form onSubmit={handleJoin} style={{ display:'flex', gap:'8px' }}>
              <input
                placeholder="Enter room code..."
                value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase())}
                maxLength={6}
                style={{ flex:1, textTransform:'uppercase', letterSpacing:'3px', fontWeight:700 }}
              />
              <button type="submit" className="btn btn-primary" disabled={!joinCode.trim()}>Join</button>
            </form>
          </div>

          {/* Create Room */}
          <div style={s.card}>
            <h2 style={s.sTitle}>➕ Create Room</h2>
            {!creating ? (
              <button className="btn btn-success" style={{ width:'100%' }} onClick={() => setCreating(true)}>
                Create New Room
              </button>
            ) : (
              <form onSubmit={handleCreate} style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
                <div>
                  <label style={{ display:'block', fontWeight:700, fontSize:'0.85rem', marginBottom:'4px' }}>Room Name (optional)</label>
                  <input placeholder="My awesome room" value={roomName} onChange={e => setRoomName(e.target.value)} maxLength={40} />
                </div>
                {error && <p style={s.error}>⚠️ {error}</p>}
                <div style={{ display:'flex', gap:'8px' }}>
                  <button type="submit" className="btn btn-success" style={{ flex:1 }} disabled={loading}>
                    {loading ? 'Creating...' : '🚀 Create & Join'}
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={() => setCreating(false)}>Cancel</button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Right: Public Rooms */}
        <div style={s.card}>
          <h2 style={s.sTitle}>🌍 Public Rooms</h2>
          {rooms.length === 0 ? (
            <p style={{ color:'var(--text-muted)', textAlign:'center', padding:'2rem 0' }}>
              No rooms yet. Create one!
            </p>
          ) : (
            rooms.map(room => {
              const full = room.playerCount >= room.maxPlayers;
              return (
                <div key={room.code} style={s.roomItem}>
                  <div>
                    <div style={{ fontWeight:700 }}>{room.name}</div>
                    <div style={{ fontSize:'0.8rem', color:'var(--text-muted)', fontFamily:'monospace' }}>{room.code}</div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                    <span style={s.badge(full)}>{room.playerCount}/{room.maxPlayers}</span>
                    <button
                      className="btn btn-primary"
                      style={{ padding:'6px 14px', fontSize:'0.85rem' }}
                      onClick={() => joinRoom(room.code)}
                      disabled={full}
                    >
                      {full ? 'Full' : 'Join'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
