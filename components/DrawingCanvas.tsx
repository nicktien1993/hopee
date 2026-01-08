import React, { useRef, useEffect, useState } from 'react';

interface Props {
  height?: number;
  id: string;
  isVisible?: boolean;
}

const COLORS = [
  { value: '#000000' }, { value: '#ef4444' }, { value: '#3b82f6' }, { value: '#22c55e' }, { value: '#f97316' }
];

const DrawingCanvas: React.FC<Props> = ({ height = 500, isVisible = true }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [color, setColor] = useState('#000000');
  
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const lastPos = useRef({ x: 0, y: 0 });

  const init = () => {
    const canvas = canvasRef.current;
    if (!canvas || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    // 設置顯示尺寸與實際繪圖尺寸（DPR 優化）
    canvas.width = rect.width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
    if (!ctx) return;
    
    ctx.scale(dpr, dpr);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, rect.width, height);
    
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctxRef.current = ctx;
  };

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(init, 50);
      window.addEventListener('resize', init);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', init);
      };
    }
  }, [isVisible]);

  const handleDown = (e: React.PointerEvent) => {
    if (!ctxRef.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    lastPos.current = { x, y };
    setIsDrawing(true);
    
    // 直接點擊也畫一點，提升反饋感
    ctxRef.current.beginPath();
    ctxRef.current.fillStyle = tool === 'eraser' ? 'white' : color;
    ctxRef.current.arc(x, y, tool === 'eraser' ? 15 : 2.5, 0, Math.PI * 2);
    ctxRef.current.fill();
    
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handleMove = (e: React.PointerEvent) => {
    if (!isDrawing || !ctxRef.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctxRef.current.beginPath();
    ctxRef.current.strokeStyle = tool === 'eraser' ? 'white' : color;
    ctxRef.current.lineWidth = tool === 'eraser' ? 30 : 5;
    ctxRef.current.moveTo(lastPos.current.x, lastPos.current.y);
    ctxRef.current.lineTo(x, y);
    ctxRef.current.stroke();
    
    lastPos.current = { x, y };
  };

  return (
    <div ref={containerRef} className="w-full no-print select-none">
      <div className="mb-3 flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl shadow-inner">
        <div className="flex bg-white rounded-xl p-1 border border-slate-100 shadow-sm">
          <button onClick={() => setTool('pen')} className={`px-5 py-1.5 rounded-lg text-sm font-black transition ${tool === 'pen' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>🖊️ 畫筆</button>
          <button onClick={() => setTool('eraser')} className={`px-5 py-1.5 rounded-lg text-sm font-black transition ${tool === 'eraser' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>🧽 橡皮擦</button>
        </div>
        <div className="flex gap-1.5 px-3">
          {COLORS.map(c => (
            <button 
              key={c.value} 
              onClick={() => { setColor(c.value); setTool('pen'); }} 
              className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${color === c.value && tool === 'pen' ? 'border-slate-800 scale-110 shadow-md' : 'border-transparent shadow-inner'}`} 
              style={{ backgroundColor: c.value }} 
            />
          ))}
        </div>
        <button onClick={() => init()} className="ml-auto px-5 py-1.5 bg-white rounded-xl text-sm font-black border border-rose-200 text-rose-500 hover:bg-rose-50 transition active:scale-95">🗑️ 全清</button>
      </div>
      <div className="rounded-3xl border-2 border-slate-200 bg-white shadow-inner overflow-hidden">
        <canvas 
          ref={canvasRef} 
          onPointerDown={handleDown} 
          onPointerMove={handleMove} 
          onPointerUp={() => setIsDrawing(false)}
          onPointerCancel={() => setIsDrawing(false)}
          className="block cursor-crosshair touch-none"
          style={{ touchAction: 'none' }}
        />
      </div>
    </div>
  );
};

export default DrawingCanvas;