import { useRef, useCallback, useEffect } from 'react';
import { floodFill } from '../utils/canvas';


 //Core canvas drawing hook.
 // Returns refs and event handlers for the drawing canvas.
 
export const useCanvas = ({ canvasRef, color, size, tool, onStroke, onFill, isDrawer }) => {
  const isDrawing   = useRef(false);
  const lastPoint   = useRef(null);
  const currentPath = useRef([]);

  // Get canvas-relative coordinates 
  const getPos = useCallback((e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: Math.round((clientX - rect.left) * scaleX),
      y: Math.round((clientY - rect.top)  * scaleY),
    };
  }, []);

  //  Draw a stroke on the local canvas 
  const drawLine = useCallback((ctx, p1, p2, strokeColor, strokeSize, strokeTool) => {
    ctx.globalCompositeOperation = strokeTool === 'eraser' ? 'destination-out' : 'source-over';
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth   = strokeSize;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
  }, []);

  //Pointer down 
  const onPointerDown = useCallback((e) => {
    if (!isDrawer) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    e.preventDefault();

    const pos = getPos(e, canvas);

    if (tool === 'fill') {
      const ctx = canvas.getContext('2d');
      floodFill(ctx, canvas, pos.x, pos.y, color);
      onFill?.(pos.x, pos.y, color);
      return;
    }

    isDrawing.current = true;
    lastPoint.current = pos;
    currentPath.current = [pos];
  }, [isDrawer, tool, color, canvasRef, getPos, onFill]);

  //  Pointer move
  const onPointerMove = useCallback((e) => {
    if (!isDrawing.current || !isDrawer) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    e.preventDefault();

    const pos  = getPos(e, canvas);
    const ctx  = canvas.getContext('2d');
    const prev = lastPoint.current;

    drawLine(ctx, prev, pos, color, size, tool);

    currentPath.current.push(pos);
    lastPoint.current = pos;

    // Throttle: send every ~3 points to reduce bandwidth
    if (currentPath.current.length % 3 === 0) {
      onStroke?.({ points: [prev, pos], color, size, tool });
    }
  }, [isDrawer, color, size, tool, canvasRef, getPos, drawLine, onStroke]);

  // Pointer up 
  const onPointerUp = useCallback(() => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    // Flush remaining points
    if (currentPath.current.length > 0) {
      onStroke?.({ points: currentPath.current, color, size, tool, final: true });
      currentPath.current = [];
    }
    lastPoint.current = null;
  }, [color, size, tool, onStroke]);

  // Receive remote stroke (for guessers) 
  const applyRemoteStroke = useCallback(({ points, color: c, size: s, tool: t }) => {
    const canvas = canvasRef.current;
    if (!canvas || points.length < 2) return;
    const ctx = canvas.getContext('2d');
    for (let i = 1; i < points.length; i++) {
      drawLine(ctx, points[i - 1], points[i], c, s, t);
    }
  }, [canvasRef, drawLine]);

  // Receive remote fill
  const applyRemoteFill = useCallback(({ x, y, color: c }) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    floodFill(ctx, canvas, x, y, c);
  }, [canvasRef]);

  // Clear canvas
  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, [canvasRef]);

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    applyRemoteStroke,
    applyRemoteFill,
    clearCanvas,
  };
};
