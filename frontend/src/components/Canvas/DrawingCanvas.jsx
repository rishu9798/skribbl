import { useRef, useEffect, useState, useCallback } from 'react';
import { useCanvas }    from '../../hooks/useCanvas';
import Toolbar          from './Toolbar';
import CanvasOverlay    from './CanvasOverlay';
import { EVENTS, CANVAS_WIDTH, CANVAS_HEIGHT } from '../../utils/constants';

export default function DrawingCanvas({ roomCode, socket, isDrawer, gameStatus }) {
  const canvasRef = useRef(null);
  const [color,   setColor]   = useState('#000000');
  const [size,    setSize]    = useState(4);
  const [tool,    setTool]    = useState('pen');

  // Canvas init
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width  = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const onStroke = useCallback((strokeData) => {
    socket?.emit(EVENTS.DRAW_STROKE, { roomCode, ...strokeData });
  }, [socket, roomCode]);

  const onFill = useCallback((x, y, fillColor) => {
    socket?.emit(EVENTS.FILL_CANVAS, { roomCode, x, y, color: fillColor });
  }, [socket, roomCode]);

  const { onPointerDown, onPointerMove, onPointerUp, applyRemoteStroke, applyRemoteFill, clearCanvas } = useCanvas({
    canvasRef, color, size, tool, onStroke, onFill, isDrawer,
  });

  // Listen for remote drawing events
  useEffect(() => {
    if (!socket) return;

    const handlers = {
      [EVENTS.DRAW_STROKE]:  applyRemoteStroke,
      [EVENTS.FILL_CANVAS]:  applyRemoteFill,
      [EVENTS.CLEAR_CANVAS]: clearCanvas,
      'turn-started':        clearCanvas,
    };

    Object.entries(handlers).forEach(([ev, fn]) => socket.on(ev, fn));
    return () => Object.entries(handlers).forEach(([ev, fn]) => socket.off(ev, fn));
  }, [socket, applyRemoteStroke, applyRemoteFill, clearCanvas]);

  const handleClear = () => {
    clearCanvas();
    socket?.emit(EVENTS.CLEAR_CANVAS, { roomCode });
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', flex:1, gap:'8px', overflow:'hidden' }}>
      {isDrawer && (
        <Toolbar
          color={color} setColor={setColor}
          size={size}   setSize={setSize}
          tool={tool}   setTool={setTool}
          onClear={handleClear}
        />
      )}

      <div style={{ position:'relative', flex:1, display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', background:'#f8fafc', borderRadius:'12px', border:'2px solid var(--border)' }}>
        <canvas
          ref={canvasRef}
          style={{
            maxWidth:  '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            cursor:    isDrawer ? (tool === 'fill' ? 'crosshair' : 'url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\'%3E%3Ccircle cx=\'8\' cy=\'8\' r=\'6\' fill=\'none\' stroke=\'%23000\' stroke-width=\'2\'/%3E%3C/svg%3E") 8 8, crosshair') : 'default',
            touchAction:'none',
            display:'block',
            background: 'white',
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        />

        <CanvasOverlay gameStatus={gameStatus} isDrawer={isDrawer} />
      </div>
    </div>
  );
}
