import React, { useState } from 'react';
import { SelectionParams, Chapter, HandoutContent, HomeworkContent, HomeworkConfig } from './types.ts';
import { fetchChapters, generateHandoutFromText, generateHomework } from './services/geminiService.ts';
import HandoutViewer from './components/HandoutViewer.tsx';
import HomeworkViewer from './components/HomeworkViewer.tsx';
import DrawingCanvas from './components/DrawingCanvas.tsx';

type AppStep = 'start' | 'publisher' | 'grade' | 'library' | 'handout' | 'homework';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>('start');
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState<SelectionParams>({
    year: '114',
    publisher: '康軒',
    grade: '一年級',
    semester: '上',
    difficulty: '易'
  });
  
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [handout, setHandout] = useState<HandoutContent | null>(null);
  const [homework, setHomework] = useState<HomeworkContent | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<{chapter: string, sub: string} | null>(null);

  // --- Actions ---
  
  const startApp = () => setStep('publisher');

  const selectPublisher = (p: string) => {
    setParams({ ...params, publisher: p as any });
    setStep('grade');
  };

  const selectGrade = async (grade: string, sem: string) => {
    const newParams = { ...params, grade: grade as any, semester: sem as any };
    setParams(newParams);
    setLoading(true);
    try {
      const data = await fetchChapters(newParams);
      setChapters(data);
      setStep('library');
    } catch (e) {
      alert("目錄載入失敗，請確認網路或金鑰。");
    } finally {
      setLoading(false);
    }
  };

  const startGenerate = async (chapter: string, sub: string) => {
    setSelectedUnit({ chapter, sub });
    setLoading(true);
    try {
      const content = await generateHandoutFromText(params, chapter, sub);
      setHandout(content);
      setStep('handout');
    } catch (e) {
      alert("講義生成失敗！");
    } finally {
      setLoading(false);
    }
  };

  // --- UI Components ---

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-8">
        <div className="relative w-24 h-24 mb-8">
          <div className="absolute inset-0 border-8 border-blue-100 rounded-full"></div>
          <div className="absolute inset-0 border-8 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <h2 className="text-2xl font-black text-slate-800">正在施展數學魔法...</h2>
        <p className="text-slate-400 mt-2 font-bold italic">這可能需要 10-20 秒，請喝杯茶休息一下</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 py-4 px-8 flex justify-between items-center no-print">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setStep('start')}>
          <span className="text-3xl">✨</span>
          <h1 className="text-xl font-black text-slate-900">魔法數學助手</h1>
        </div>
        <button 
          onClick={() => (window as any).aistudio?.openSelectKey?.()}
          className="bg-slate-100 text-slate-500 px-4 py-2 rounded-xl text-sm font-bold hover:bg-white border border-slate-200"
        >
          🔑 金鑰
        </button>
      </header>

      <main className="max-w-4xl mx-auto py-12 px-6">
        
        {step === 'start' && (
          <div className="page-transition text-center py-20">
            <div className="text-9xl mb-8">🏫</div>
            <h2 className="text-5xl font-black text-slate-900 mb-6">歡迎來到資源班數學屋</h2>
            <p className="text-xl text-slate-500 mb-12 font-bold leading-loose">
              我們將協助您製作符合特教需求、<br/>
              具象化、大字體的數學講義與隨堂卷。
            </p>
            <button 
              onClick={startApp}
              className="bg-blue-600 text-white px-12 py-6 rounded-[2.5rem] text-2xl font-black shadow-2xl hover:bg-blue-700 hover:scale-105 transition-all"
            >
              開始製作 ➜
            </button>
          </div>
        )}

        {step === 'publisher' && (
          <div className="page-transition">
            <h2 className="text-3xl font-black text-slate-800 mb-8 text-center">請選擇出版社</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {['康軒', '南一', '翰林'].map(p => (
                <button 
                  key={p}
                  onClick={() => selectPublisher(p)}
                  className="bg-white p-10 rounded-[3rem] shadow-sm border-4 border-transparent hover:border-blue-500 hover:shadow-xl transition-all group"
                >
                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">📚</div>
                  <div className="text-2xl font-black text-slate-700">{p}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'grade' && (
          <div className="page-transition">
            <h2 className="text-3xl font-black text-slate-800 mb-8 text-center">選擇年級與學期</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
              {['一年級', '二年級', '三年級', '四年級', '五年級', '六年級'].map(g => (
                <button 
                  key={g}
                  onClick={() => setParams({...params, grade: g as any})}
                  className={`py-4 rounded-2xl font-black border-2 transition-all ${params.grade === g ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 text-slate-500 hover:border-blue-400'}`}
                >
                  {g}
                </button>
              ))}
            </div>
            <div className="flex gap-4 mb-12">
              {['上', '下'].map(s => (
                <button 
                  key={s}
                  onClick={() => setParams({...params, semester: s as any})}
                  className={`flex-1 py-4 rounded-2xl font-black border-2 transition-all ${params.semester === s ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 text-slate-500'}`}
                >
                  {s}學期
                </button>
              ))}
            </div>
            <button 
              onClick={() => selectGrade(params.grade, params.semester)}
              className="w-full bg-blue-600 text-white py-6 rounded-[2.5rem] text-xl font-black shadow-lg hover:bg-blue-700"
            >
              下一步：讀取目錄 ➜
            </button>
          </div>
        )}

        {step === 'library' && (
          <div className="page-transition">
            <div className="bg-white rounded-[3rem] p-8 mb-8 border border-slate-200">
              <h2 className="text-3xl font-black text-slate-800 mb-2">請選擇製作單元</h2>
              <p className="text-slate-400 font-bold mb-8 italic">來源版本：{params.publisher} {params.grade}{params.semester}</p>
              
              <div className="space-y-6">
                {chapters.map(c => (
                  <div key={c.id} className="border-t border-slate-100 pt-6">
                    <h3 className="text-xl font-black text-blue-800 mb-4">單元 {c.id}：{c.title}</h3>
                    <div className="grid grid-cols-1 gap-3">
                      {c.subChapters.map((sub, idx) => (
                        <button 
                          key={idx}
                          onClick={() => startGenerate(c.title, sub)}
                          className="text-left bg-slate-50 p-4 rounded-2xl font-bold text-slate-600 hover:bg-blue-600 hover:text-white transition-all group flex justify-between items-center"
                        >
                          <span>{sub}</span>
                          <span className="opacity-0 group-hover:opacity-100">🪄</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={() => setStep('grade')} className="text-slate-400 font-bold hover:text-slate-600">← 返回重選</button>
          </div>
        )}

        {step === 'handout' && handout && (
          <div className="page-transition">
            <div className="mb-8 no-print flex gap-4">
               <button onClick={() => setStep('library')} className="bg-white border-2 border-slate-200 px-6 py-2 rounded-full font-bold text-slate-500 hover:bg-slate-50">← 返回清單</button>
               <button onClick={() => window.print()} className="bg-slate-900 text-white px-8 py-2 rounded-full font-bold shadow-lg">🖨️ 列印講義</button>
            </div>
            <HandoutViewer content={handout} params={params} />
            
            <div className="mt-16 bg-orange-100 p-10 rounded-[4rem] text-center no-print">
              <h3 className="text-3xl font-black text-orange-900 mb-4">學得差不多了嗎？</h3>
              <p className="text-orange-700 font-bold mb-8">立刻為孩子生成一份專屬的隨堂練習卷！</p>
              <button 
                onClick={async () => {
                   setLoading(true);
                   try {
                     const hw = await generateHomework(params, selectedUnit!.chapter, selectedUnit!.sub, { calculationCount: 3, wordProblemCount: 2, difficulty: '易' });
                     setHomework(hw);
                     setStep('homework');
                   } finally {
                     setLoading(false);
                   }
                }}
                className="bg-orange-500 text-white px-10 py-5 rounded-full text-xl font-black shadow-xl hover:bg-orange-600 transition-all"
              >
                生成練習卷 ➜
              </button>
            </div>
          </div>
        )}

        {step === 'homework' && homework && (
          <div className="page-transition">
             <div className="mb-8 no-print flex gap-4">
               <button onClick={() => setStep('handout')} className="bg-white border-2 border-slate-200 px-6 py-2 rounded-full font-bold text-slate-500 hover:bg-slate-50">← 返回講義</button>
               <button onClick={() => window.print()} className="bg-slate-900 text-white px-8 py-2 rounded-full font-bold shadow-lg">🖨️ 列印考卷</button>
            </div>
            <HomeworkViewer content={homework} params={params} />
          </div>
        )}

      </main>

      {/* Footer info */}
      <footer className="py-20 text-center text-slate-300 font-bold text-sm no-print">
        ✨ 魔法助手專為資源班教師設計，祝您教學愉快 ✨
      </footer>
    </div>
  );
};

export default App;