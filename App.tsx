import React, { useState, useEffect } from 'react';
import { SelectionParams, Chapter, HandoutContent, HomeworkContent, HomeworkConfig } from './types.ts';
import { fetchChapters, generateHandoutFromText, generateHomework } from './services/geminiService.ts';
import HandoutViewer from './components/HandoutViewer.tsx';
import HomeworkViewer from './components/HomeworkViewer.tsx';

type WizardStep = 'welcome' | 'publisher' | 'grade' | 'library' | 'display';

const App: React.FC = () => {
  const [step, setStep] = useState<WizardStep>('welcome');
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState<SelectionParams>({
    year: '114',
    publisher: '康軒',
    grade: '一年級',
    semester: '上',
    difficulty: '易'
  });

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [activeContent, setActiveContent] = useState<{
    type: 'handout' | 'homework';
    data: any;
  } | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<{chapter: string, sub: string} | null>(null);

  // --- 邏輯函數 ---

  const handleNextStep = (next: WizardStep) => setStep(next);

  const handleSelectPublisher = (p: any) => {
    setParams({ ...params, publisher: p });
    setStep('grade');
  };

  const handleFetchLibrary = async () => {
    setLoading(true);
    try {
      const data = await fetchChapters(params);
      setChapters(data);
      setStep('library');
    } catch (e) {
      alert("目錄召喚失敗，請確認網路或金鑰！");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateHandout = async (chapter: string, sub: string) => {
    setSelectedUnit({ chapter, sub });
    setLoading(true);
    try {
      const content = await generateHandoutFromText(params, chapter, sub);
      setActiveContent({ type: 'handout', data: content });
      setStep('display');
    } catch (e) {
      alert("講義生成失敗！");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateHomework = async () => {
    if (!selectedUnit) return;
    setLoading(true);
    try {
      const config: HomeworkConfig = { calculationCount: 3, wordProblemCount: 2, difficulty: '易' };
      const content = await generateHomework(params, selectedUnit.chapter, selectedUnit.sub, config);
      setActiveContent({ type: 'homework', data: content });
      setStep('display');
    } catch (e) {
      alert("練習卷生成失敗！");
    } finally {
      setLoading(false);
    }
  };

  // --- UI 元件 ---

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-10">
        <div className="w-24 h-24 border-[12px] border-slate-100 border-t-blue-600 rounded-full animate-spin mb-8"></div>
        <h2 className="text-3xl font-black text-slate-800">正在施展數學魔法...</h2>
        <p className="text-slate-400 mt-4 font-bold text-lg animate-pulse">大約需要 15 秒，魔法正在趕路中 🪄</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 導航欄 */}
      <header className="no-print bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 py-4 px-8 flex justify-between items-center">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setStep('welcome')}>
          <span className="text-2xl">✨</span>
          <h1 className="text-lg font-black text-slate-900 tracking-tight">魔法數學助手</h1>
        </div>
        <div className="flex gap-3">
          {step !== 'welcome' && (
            <button 
              onClick={() => setStep('welcome')}
              className="text-slate-500 font-bold hover:text-slate-800 px-4 py-2 text-sm"
            >
              回首頁
            </button>
          )}
          <button 
            onClick={() => (window as any).aistudio?.openSelectKey?.()}
            className="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-black shadow-lg shadow-blue-100"
          >
            🔑 設定金鑰
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto py-12 px-6">
        
        {step === 'welcome' && (
          <div className="wizard-card text-center py-24 bg-white rounded-[4rem] shadow-2xl shadow-slate-200 border border-slate-100">
            <div className="text-9xl mb-12">🧙‍♂️</div>
            <h2 className="text-6xl font-black text-slate-900 mb-8 leading-tight">讓數學學習<br/><span className="text-blue-600">像魔法一樣簡單</span></h2>
            <p className="text-2xl text-slate-400 mb-16 font-bold max-w-2xl mx-auto leading-relaxed">
              專為特教老師設計，一鍵生成具象化、<br/>
              大字體的國小數學講義與練習卷。
            </p>
            <button 
              onClick={() => setStep('publisher')}
              className="bg-blue-600 text-white px-16 py-8 rounded-[3rem] text-3xl font-black shadow-2xl hover:bg-blue-700 hover:scale-105 transition-all active:scale-95"
            >
              立即開始 ➔
            </button>
          </div>
        )}

        {step === 'publisher' && (
          <div className="wizard-card">
            <h2 className="text-4xl font-black text-slate-800 mb-12 text-center">請選擇教材出版社</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {['康軒', '南一', '翰林'].map(p => (
                <button 
                  key={p}
                  onClick={() => handleSelectPublisher(p)}
                  className="bg-white group p-12 rounded-[3.5rem] shadow-sm border-4 border-transparent hover:border-blue-500 hover:shadow-2xl transition-all"
                >
                  <div className="text-7xl mb-6 group-hover:rotate-12 transition-transform">📖</div>
                  <div className="text-3xl font-black text-slate-700">{p}</div>
                  <div className="text-slate-300 font-bold mt-2">版本選取</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'grade' && (
          <div className="wizard-card max-w-3xl mx-auto">
            <h2 className="text-4xl font-black text-slate-800 mb-12 text-center">選擇年級與學期</h2>
            <div className="bg-white p-12 rounded-[4rem] shadow-xl border border-slate-100">
              <div className="grid grid-cols-2 gap-4 mb-8">
                {['一年級', '二年級', '三年級', '四年級', '五年級', '六年級'].map(g => (
                  <button 
                    key={g}
                    onClick={() => setParams({...params, grade: g as any})}
                    className={`py-5 rounded-3xl font-black text-xl border-4 transition-all ${params.grade === g ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100'}`}
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
                    className={`flex-1 py-5 rounded-3xl font-black text-xl border-4 transition-all ${params.semester === s ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-slate-50 border-transparent text-slate-400'}`}
                  >
                    {s}學期
                  </button>
                ))}
              </div>
              <button 
                onClick={handleFetchLibrary}
                className="w-full bg-slate-900 text-white py-8 rounded-[2.5rem] text-2xl font-black shadow-2xl hover:bg-black transition-all"
              >
                載入目錄地圖 ➔
              </button>
              <button onClick={() => setStep('publisher')} className="w-full mt-6 text-slate-400 font-bold hover:text-slate-600 transition-colors">← 返回重新選擇出版社</button>
            </div>
          </div>
        )}

        {step === 'library' && (
          <div className="wizard-card">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-4xl font-black text-slate-900 mb-2">請選擇製作單元</h2>
                <p className="text-xl text-slate-400 font-bold italic">{params.publisher} • {params.grade}{params.semester}</p>
              </div>
              <button onClick={() => setStep('grade')} className="bg-white border-2 border-slate-200 px-6 py-3 rounded-2xl font-black text-slate-400 hover:bg-slate-50">← 返回改年級</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {chapters.map(c => (
                <div key={c.id} className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-200 hover:shadow-xl transition-all">
                  <span className="bg-blue-100 text-blue-700 font-black px-4 py-1.5 rounded-full text-sm mb-6 inline-block uppercase tracking-wider">單元 {c.id}</span>
                  <h3 className="text-3xl font-black text-slate-800 mb-8 h-20 overflow-hidden">{c.title}</h3>
                  <div className="space-y-3">
                    {c.subChapters.map((sub, idx) => (
                      <button 
                        key={idx}
                        onClick={() => handleGenerateHandout(c.title, sub)}
                        className="w-full text-left p-5 rounded-2xl font-bold text-slate-600 hover:bg-blue-600 hover:text-white transition-all group flex justify-between items-center"
                      >
                        <span className="truncate">{sub}</span>
                        <span className="opacity-0 group-hover:opacity-100 text-2xl">🪄</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 'display' && activeContent && (
          <div className="wizard-card space-y-12">
            <div className="no-print flex justify-between items-center bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200">
              <div className="flex gap-4">
                <button onClick={() => setStep('library')} className="px-6 py-3 rounded-2xl font-black text-slate-500 hover:bg-slate-50 border-2 border-slate-100">← 返回目錄</button>
                {activeContent.type === 'handout' ? (
                  <button 
                    onClick={handleGenerateHomework}
                    className="bg-orange-500 text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-orange-100 hover:bg-orange-600"
                  >
                    生成隨堂卷 ➔
                  </button>
                ) : (
                  <button 
                    onClick={() => setStep('display')} // 只是重新回到當前內容
                    className="bg-blue-100 text-blue-600 px-8 py-3 rounded-2xl font-black"
                    disabled
                  >
                    已生成練習卷
                  </button>
                )}
              </div>
              <button 
                onClick={() => window.print()}
                className="bg-slate-900 text-white px-10 py-3 rounded-2xl font-black shadow-xl hover:bg-black"
              >
                🖨️ 列印文件
              </button>
            </div>

            {activeContent.type === 'handout' ? (
              <HandoutViewer content={activeContent.data} params={params} />
            ) : (
              <HomeworkViewer content={activeContent.data} params={params} />
            )}
          </div>
        )}

      </main>

      <footer className="no-print py-24 text-center text-slate-300 font-bold tracking-widest uppercase text-xs">
        專為特教職人打造 • 魔法與愛並存
      </footer>
    </div>
  );
};

export default App;