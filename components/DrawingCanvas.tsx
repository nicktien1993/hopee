
import React, { useRef, useEffect, useState } from 'react';

interface Props {
  height?: number;
  id: string;
  isVisible?: boolean;
}

const COLORS = [
  { name: '黑色', value: '#000000' },
  { name: '紅色', value: '#ef4444' },
  { name: '橘色', value: '#f97316' },
  { name: '黃色', value: '#eab308' },
  { name: '綠色', value: '#22c55e' },
  { name: '藍色', value: '#3b82f6' },
];

const DrawingCanvas: React.FC<Props> = ({ height = 500, id, isVisible = true }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(6);
  
  const state = useRef({
    lastX: 0,
    lastY: 0,
    currentWidth: 0,
    // 用於寬度變更時保留畫像的緩存，平時繪圖不使用
    isInitialized: false
  });

  const setupCanvas = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !isVisible) return;
    
    const rect = container.getBoundingClientRect();
    if (rect.width === 0) return;

    // 只有寬度顯著改變才重新設置
    if (Math.abs(rect.width - state.current.currentWidth) < 5 && state.current.isInitialized) return;

    const dpr = window.devicePixelRatio || 1;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    let snapshot: string | null = null;
    if (state.current.isInitialized) {
      snapshot = canvas.toDataURL();
    }
    
    state.current.currentWidth = rect.width;
    canvas.width = rect.width * dpr;
    canvas.height = height * dpr;
    canvas.style.height = `${height}px`;

    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    drawHelperLines(ctx, rect.width, height);

    if (snapshot) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, height);
      };
      img.src = snapshot;
    }
    
    state.current.isInitialized = true;
  };

  const drawHelperLines = (c: CanvasRenderingContext2D, w: number, h: number) => {
    c.save();
    c.strokeStyle = '#f8fafc';
    c.lineWidth = 1;
    for (let y = 50; y < h; y += 50) {
      c.beginPath();
      c.moveTo(0, y);
      c.lineTo(w, y);
      c.stroke();
    }
    c.restore();
  };

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      window.requestAnimationFrame(() => setupCanvas());
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [isVisible, height]);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => setupCanvas(), 50);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  const getPointerPos = (e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pos = getPointerPos(e);
    state.current.lastX = pos.x;
    state.current.lastY = pos.y;
    setIsDrawing(true);

    // 直接點擊也畫一個點
    ctx.beginPath();
    ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
    ctx.fillStyle = tool === 'eraser' ? 'white' : brushColor;
    ctx.arc(pos.x, pos.y, (tool === 'eraser' ? brushSize * 4 : brushSize / 2), 0, Math.PI * 2);
    ctx.fill();
    
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    const pos = getPointerPos(e);

    ctx.beginPath();
    ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
    ctx.lineWidth = tool === 'eraser' ? brushSize * 8 : brushSize;
    ctx.strokeStyle = brushColor;
    ctx.moveTo(state.current.lastX, state.current.lastY);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    state.current.lastX = pos.x;
    state.current.lastY = pos.y;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDrawing(false);
    if (e.target) (e.target as Element).releasePointerCapture(e.pointerId);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, height);
    drawHelperLines(ctx, rect.width, height);
  };

  return (
    <div ref={containerRef} className="w-full relative group no-print select-none touch-none">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-50 border border-slate-200 rounded-3xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-inner">
            <button onClick={() => setTool('pen')} className={`px-4 py-2 rounded-xl text-sm font-black transition-all ${tool === 'pen' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>🖊️ 寫字筆</button>
            <button onClick={() => setTool('eraser')} className={`px-4 py-2 rounded-xl text-sm font-black transition-all ${tool === 'eraser' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>🧽 橡皮擦</button>
          </div>
          <div className="flex gap-2 p-1.5 bg-white rounded-2xl border border-slate-100">
            {COLORS.map((c) => (
              <button key={c.value} onClick={() => { setBrushColor(c.value); setTool('pen'); }} className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-125 ${brushColor === c.value && tool === 'pen' ? 'border-slate-800 scale-110 shadow-md ring-2 ring-slate-100' : 'border-transparent'}`} style={{ backgroundColor: c.value }} />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-slate-100">
            <span className="text-xs font-black text-slate-400">粗細</span>
            <input type="range" min="1" max="30" value={brushSize} onChange={(e) => setBrushSize(parseInt(e.target.value))} className="w-24 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600" />
          </div>
          <button onClick={clearCanvas} className="px-5 py-2 rounded-2xl text-sm font-black text-rose-500 bg-white border border-rose-100 hover:bg-rose-50 transition-all shadow-sm active:scale-95">🗑️ 清除</button>
        </div>
      </div>
      <div className="border-4 border-dashed border-blue-100 rounded-[2.5rem] bg-white overflow-hidden shadow-inner ring-4 ring-slate-50">
        <canvas ref={canvasRef} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp} onPointerCancel={handlePointerUp} className="block cursor-crosshair w-full" style={{ touchAction: 'none' }} />
      </div>
    </div>
  );
};

export default DrawingCanvas;
