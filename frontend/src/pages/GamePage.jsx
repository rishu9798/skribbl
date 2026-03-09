import { useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth }              from '../hooks/useAuth';
import { useSocket, useGameSocketEvents } from '../hooks/useSocket';
import { GameContext }          from '../context/GameContext';
import { EVENTS }               from '../utils/constants';
import DrawingCanvas            from '../components/Canvas/DrawingCanvas';
import ChatBox                  from '../components/Chat/ChatBox';
import Scoreboard               from '../components/Game/Scoreboard';
import WordHint                 from '../components/Game/WordHint';
import RoundTimer               from '../components/Game/RoundTimer';
import WordPicker               from '../components/Game/WordPicker';
import RoundSummary             from '../components/Game/RoundSummary';

export default function GamePage() {
  const { roomCode }           = useParams();
  const { user, token }        = useAuth();
  const { connect, socket }    = useSocket();
  const { state, dispatch }    = useContext(GameContext);
  const navigate               = useNavigate();
  const joined                 = useRef(false);

  // Wire up all game socket events
  useGameSocketEvents(socket);

  // Connect socket and join room on mount
  useEffect(() => {
    const sock = connect(token || localStorage.getItem('token'), user?.username);

    if (!joined.current && sock) {
      joined.current = true;
      // Wait for connection
      const tryJoin = () => {
        if (sock.connected) {
          sock.emit(EVENTS.JOIN_ROOM, { roomCode });
        } else {
          sock.once('connect', () => sock.emit(EVENTS.JOIN_ROOM, { roomCode }));
        }
      };
      tryJoin();
    }

    return () => {
      if (sock?.connected) {
        sock.emit(EVENTS.LEAVE_ROOM, { roomCode });
      }
    };
  }, []);

  const isMyTurn = state.drawerSocketId === socket?.id;
  const isPlaying = state.gameStatus === 'drawing' || state.gameStatus === 'choosing';
  const showWordPicker = state.gameStatus === 'choosing' && isMyTurn && state.wordOptions.length > 0;
  const showSummary = state.gameStatus === 'summary';

  const sendMessage = (message) => {
    socket?.emit(EVENTS.SEND_MESSAGE, { roomCode, message });
  };

  const startGame = () => {
    socket?.emit(EVENTS.START_GAME, { roomCode });
  };

  const s = {
    page:    { display:'flex', flexDirection:'column', height:'100vh', background:'var(--bg)', overflow:'hidden' },
    topBar:  { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 16px', background:'white', borderBottom:'1px solid var(--border)', flexShrink:0 },
    logo:    { fontFamily:"'Fredoka One', cursive", fontSize:'1.5rem', color:'var(--primary)' },
    code:    { fontFamily:'monospace', fontWeight:700, fontSize:'1rem', background:'var(--bg)', padding:'4px 12px', borderRadius:'6px', letterSpacing:'2px' },
    main:    { display:'flex', flex:1, overflow:'hidden' },
    left:    { width:'200px', flexShrink:0, display:'flex', flexDirection:'column', background:'white', borderRight:'1px solid var(--border)', overflow:'auto', padding:'12px' },
    center:  { flex:1, display:'flex', flexDirection:'column', overflow:'hidden', padding:'12px' },
    right:   { width:'280px', flexShrink:0, display:'flex', flexDirection:'column', background:'white', borderLeft:'1px solid var(--border)' },
    roomCode:{ fontSize:'0.75rem', color:'var(--text-muted)', textAlign:'center', padding:'8px', borderBottom:'1px solid var(--border)', fontFamily:'monospace', letterSpacing:'2px', fontWeight:700 },
  };

  return (
    <div style={s.page}>
      {/* Top bar */}
      <div style={s.topBar}>
        <span style={s.logo}>🎨 Skribbl</span>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          {isPlaying && <RoundTimer timeLeft={state.timeLeft} drawTime={state.room?.settings?.drawTime || 80} />}
          {isPlaying && <WordHint hint={state.hint} currentWord={isMyTurn ? state.currentWord : null} />}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
          <span style={s.code}>{roomCode}</span>
          <button className="btn btn-ghost" style={{ padding:'6px 12px', fontSize:'0.85rem' }} onClick={() => navigate('/lobby')}>
            Leave
          </button>
        </div>
      </div>

      <div style={s.main}>
        {/* Left: Scoreboard */}
        <div style={s.left}>
          <Scoreboard players={state.players} currentDrawerSocketId={state.drawerSocketId} mySocketId={socket?.id} />

          {/* Host: start game button */}
          {state.gameStatus === 'waiting' && state.players.find(p => p.socketId === socket?.id)?.isHost && (
            <button className="btn btn-success" style={{ marginTop:'auto', width:'100%' }} onClick={startGame}>
              🎮 Start Game
            </button>
          )}
          {state.gameStatus === 'waiting' && !state.players.find(p => p.socketId === socket?.id)?.isHost && (
            <p style={{ marginTop:'auto', color:'var(--text-muted)', fontSize:'0.85rem', textAlign:'center' }}>
              Waiting for host to start...
            </p>
          )}
        </div>

        {/* Center: Canvas */}
        <div style={s.center}>
          <DrawingCanvas
            roomCode={roomCode}
            socket={socket}
            isDrawer={isMyTurn}
            gameStatus={state.gameStatus}
          />
        </div>

        {/* Right: Chat */}
        <div style={s.right}>
          <div style={s.roomCode}>Room: {roomCode}</div>
          <ChatBox
            messages={state.messages}
            onSend={sendMessage}
            isDrawer={isMyTurn}
            gameStatus={state.gameStatus}
            mySocketId={socket?.id}
            guessedPlayers={[]}
          />
        </div>
      </div>

      {/* Modals */}
      {showWordPicker && (
        <WordPicker
          words={state.wordOptions}
          onPick={(word) => {
            dispatch({ type: 'WORD_CHOSEN', word });
            socket?.emit(EVENTS.WORD_CHOSEN, { roomCode, word });
          }}
        />
      )}
      {showSummary && state.turnResult && (
        <RoundSummary result={state.turnResult} />
      )}
      {state.gameStatus === 'ended' && state.gameResult && (
        <GameOver rankings={state.gameResult} onPlayAgain={() => navigate('/lobby')} />
      )}
    </div>
  );
}

function GameOver({ rankings, onPlayAgain }) {
  const medals = ['🥇','🥈','🥉'];
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100 }}>
      <div style={{ background:'white', borderRadius:'20px', padding:'2.5rem', minWidth:'360px', textAlign:'center', animation:'bounceIn 0.4s ease' }}>
        <h2 style={{ fontFamily:"'Fredoka One', cursive", fontSize:'2rem', color:'var(--primary)', marginBottom:'1.5rem' }}>🎉 Game Over!</h2>
        {rankings.map((p, i) => (
          <div key={p.socketId} style={{ display:'flex', justifyContent:'space-between', padding:'10px 16px', borderRadius:'10px', background: i === 0 ? '#fef9c3' : 'var(--bg)', marginBottom:'8px' }}>
            <span style={{ fontWeight:700 }}>{medals[i] || `${i+1}.`} {p.username}</span>
            <span style={{ fontWeight:800, color:'var(--primary)' }}>{p.score} pts</span>
          </div>
        ))}
        <button className="btn btn-primary btn-lg" style={{ marginTop:'1.5rem', width:'100%' }} onClick={onPlayAgain}>
          🔄 Play Again
        </button>
      </div>
    </div>
  );
}
