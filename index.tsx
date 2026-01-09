import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";

// --- 1. Types 定義 ---
type Publisher = '康軒' | '南一' | '翰林';
type Semester = '上' | '下';
type Grade = '一年級' | '二年級' | '三年級' | '四年級' | '五年級' | '六年級';
type Difficulty = '易' | '中' | '難';

interface SelectionParams {
  year: string;
  publisher: Publisher;
  semester: Semester;
  grade: Grade;
  difficulty: Difficulty;
}

interface Chapter {
  id: string;
  title: string;
  subChapters: string[];
}

interface HandoutContent {
  title: string;
  concept: string;
  visualAidSvg?: string;
  examples: Array<{
    question: string;
    stepByStep: string[];
    answer: string;
    visualAidSvg?: string;
  }>;
  exercises: Array<{
    question: string;
    answer: string;
  }>;
  tips: string;
  checklist: string[]; 
}

// --- 2. 服務邏輯 ---
const SPECIAL_ED_INSTRUCTION = `你是一位資深的國小特教老師（資源班）。
你的學生在理解抽象數學符號上有困難，因此你的任務是製作「極度具象化」的教材。
【規範】：字體極大，句子極短。禁止僅用術語，需加註口語：『(全部有多少)』、『(一份拿走幾個)』。
SVG 需使用粗線條 (stroke-width: 5) 與鮮艷高對比顏色，畫出具象數量。`;

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fetchChapters = async (params: SelectionParams): Promise<Chapter[]> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `請搜尋並列出 ${params.year}學年度 ${params.publisher}版 國小數學 ${params.grade}${params.semester} 的課程單元目錄。`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            subChapters: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["id", "title", "subChapters"]
        }
      }
    }
  });
  return JSON.parse(response.text || "[]");
};

const generateHandout = async (params: SelectionParams, chapter: string, subChapter: string): Promise<HandoutContent> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `製作「${chapter} - ${subChapter}」資源班講義。難度：${params.difficulty}。需含白話概念、SVG圖、步驟例題。`,
    config: {
      systemInstruction: SPECIAL_ED_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          concept: { type: Type.STRING },
          visualAidSvg: { type: Type.STRING },
          examples: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: { question: { type: Type.STRING }, stepByStep: { type: Type.ARRAY, items: { type: Type.STRING } }, answer: { type: Type.STRING }, visualAidSvg: { type: Type.STRING } }
            }
          },
          exercises: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { question: { type: Type.STRING }, answer: { type: Type.STRING } } } },
          tips: { type: Type.STRING },
          checklist: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    }
  });
  return JSON.parse(response.text || "{}");
};

// --- 3. UI 組件 (整合版) ---

const DrawingCanvas = ({ id, height = 400, isVisible }: { id: string, height?: number, isVisible: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState('#000000');
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    if (isVisible && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [isVisible]);

  const startDrawing = (e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = color;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    setIsDrawing(true);
  };

  const draw = (e: React.PointerEvent) => {
    if (!isDrawing || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    const rect = canvasRef.current.getBoundingClientRect();
    if (ctx) {
      ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
      ctx.stroke();
    }
  };

  return (
    <div className="no-print mt-4">
      <div className="flex gap-2 mb-2">
        {['#000000', '#ef4444', '#3b82f6', '#22c55e'].map(c => (
          <button key={c} onClick={() => setColor(c)} className={`w-8 h-8 rounded-full border-2 ${color === c ? 'border-slate-800 scale-110' : 'border-transparent'}`} style={{backgroundColor: c}} />
        ))}
        <button onClick={() => {
          const ctx = canvasRef.current?.getContext('2d');
          if (ctx) { ctx.fillStyle="white"; ctx.fillRect(0,0,800,height); }
        }} className="ml-auto text-xs font-bold text-rose-500">清空</button>
      </div>
      <canvas ref={canvasRef} width={800} height={height} onPointerDown={startDrawing} onPointerMove={draw} onPointerUp={() => setIsDrawing(false)} className="border-2 border-slate-200 rounded-2xl bg-white w-full touch-none cursor-crosshair" />
    </div>
  );
};

// --- 4. 主程式 App ---

const App = () => {
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState<SelectionParams>({ year: '114', publisher: '康軒', grade: '一年級', semester: '上', difficulty: '易' });
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [handout, setHandout] = useState<HandoutContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [visibleCanvas, setVisibleCanvas] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if ((window as any).hideLoadingOverlay) (window as any).hideLoadingOverlay();
  }, []);

  const handleQuery = async () => {
    setLoading(true); setError(null);
    try {
      const data = await fetchChapters(params);
      setChapters(data);
    } catch { setError("搜尋目錄失敗，請確認網路或 API Key。"); }
    finally { setLoading(false); }
  };

  const handleMakeHandout = async (chap: string, sub: string) => {
    setLoading(true); setHandout(null);
    try {
      const data = await generateHandout(params, chap, sub);
      setHandout(data);
    } catch { setError("講義製作失敗。"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b p-6 flex justify-between items-center no-print">
        <h1 className="text-2xl font-black text-slate-800">✨ 數字小魔手</h1>
        <div className="text-slate-400 font-bold text-sm">資源班專用教材工坊</div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-80 bg-white border-r p-6 overflow-y-auto no-print">
          <div className="space-y-6">
            <section className="space-y-4">
              <h2 className="font-black text-slate-700">1. 設定條件</h2>
              <select value={params.publisher} onChange={e => setParams({...params, publisher: e.target.value as any})} className="w-full p-2 border rounded">
                <option>康軒</option><option>南一</option><option>翰林</option>
              </select>
              <select value={params.grade} onChange={e => setParams({...params, grade: e.target.value as any})} className="w-full p-2 border rounded">
                <option>一年級</option><option>二年級</option><option>三年級</option><option>四年級</option><option>五年級</option><option>六年級</option>
              </select>
              <button onClick={handleQuery} disabled={loading} className="w-full bg-blue-600 text-white p-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50">查詢目錄</button>
            </section>

            {chapters.length > 0 && (
              <section className="space-y-4 pt-6 border-t">
                <h2 className="font-black text-slate-700">2. 選擇單元</h2>
                {chapters.map(c => (
                  <div key={c.id} className="space-y-1">
                    <div className="text-xs font-black text-blue-500 uppercase">{c.title}</div>
                    {c.subChapters.map((sub, i) => (
                      <button key={i} onClick={() => handleMakeHandout(c.title, sub)} className="w-full text-left p-2 text-sm hover:bg-blue-50 rounded font-medium text-slate-600">
                        • {sub}
                      </button>
                    ))}
                  </div>
                ))}
              </section>
            )}
            {error && <div className="text-rose-500 text-xs font-bold bg-rose-50 p-3 rounded-lg">{error}</div>}
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-10">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="font-black text-slate-400">正在召喚魔法內容...</p>
            </div>
          ) : handout ? (
            <article className="max-w-4xl mx-auto bg-white p-12 rounded-[3rem] shadow-2xl border min-h-screen relative">
              <div className="no-print absolute top-6 right-6">
                <button onClick={() => window.print()} className="bg-slate-900 text-white px-6 py-2 rounded-full font-bold shadow-lg">🖨️ 列印</button>
              </div>

              <div className="border-b-8 border-slate-900 pb-6 mb-12">
                <h1 className="text-5xl font-black text-slate-900 mb-4">{handout.title}</h1>
                <div className="flex gap-8 text-2xl font-bold border-t-2 pt-8">
                  <span>姓名：_______________</span>
                  <span>得分：_______________</span>
                </div>
              </div>

              <section className="mb-16">
                <h2 className="text-3xl font-black bg-blue-100 text-blue-800 px-4 py-1 inline-block rounded-lg mb-6">💡 重點加油站</h2>
                <p className="text-3xl leading-relaxed text-slate-800 font-medium" dangerouslySetInnerHTML={{__html: handout.concept.replace(/(\+|\-|\×|\÷|\=)/g, '<span class="text-rose-500 px-1">$1</span>')}} />
                {handout.visualAidSvg && <div className="mt-8 p-8 bg-slate-50 rounded-3xl flex justify-center" dangerouslySetInnerHTML={{__html: handout.visualAidSvg}} />}
              </section>

              <section className="mb-16">
                <h2 className="text-3xl font-black bg-emerald-100 text-emerald-800 px-4 py-1 inline-block rounded-lg mb-6">✍️ 跟我練習做</h2>
                <div className="space-y-16">
                  {handout.examples.map((ex, i) => (
                    <div key={i} className="p-8 bg-slate-50 rounded-[2.5rem] border">
                      <div className="flex justify-between items-start mb-6">
                        <p className="text-3xl font-bold text-slate-800">例題 {i+1}：{ex.question}</p>
                        <button onClick={() => setVisibleCanvas(v => ({...v, [`ex-${i}`]: !v[`ex-${i}`]}))} className="no-print text-xs font-bold bg-white border px-3 py-1 rounded-lg shadow-sm">✏️ 畫板</button>
                      </div>
                      {visibleCanvas[`ex-${i}`] && <DrawingCanvas id={`ex-${i}`} isVisible={true} />}
                      <div className="mt-8 space-y-4">
                        {ex.stepByStep.map((s, si) => (
                          <div key={si} className="flex gap-4 items-center">
                            <span className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center font-black shrink-0">{si+1}</span>
                            <span className="text-2xl font-bold text-slate-600">{s}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </article>
          ) : (
            <div className="h-full flex flex-col items-center justify-center opacity-20">
              <span className="text-9xl">📖</span>
              <p className="text-2xl font-black mt-4">請從左側選擇單元開始</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
