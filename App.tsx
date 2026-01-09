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

  // 確保 App 有跑起來的 Debug Log
  useEffect(() => {
    console.log("✨ 魔法數學助手：App 已成功掛載");
  }, []);

  const handleFetchLibrary = async () => {
    setLoading(true);
    try {
      const data = await fetchChapters(params);
      setChapters(data || []);
      setStep('library');
    } catch (e) {
      console.error(e);
      alert("載入目錄失敗，請確認 API Key 是否設定正確。");
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
      alert("生成失敗，請稍後再試。");
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
      alert("隨堂卷生成失敗。");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-10">
        <div className="w-20 h-20 border-[10px] border-slate-100 border-t-blue-600 rounded-full animate-spin mb-8"></div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">魔法正在處理中...</h2>
        <p className="text-slate-400 mt-4 font-bold animate-pulse text-lg">大約需要 15-20 秒，請稍候</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-blue-100">
      <header className="no-print bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 py-4 px-8 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setStep('welcome')}>
          <span className="text-2xl drop-shadow-sm">✨</span>
          <h1 className="text-lg font-black text-slate-900 tracking-tight">魔法數學助手</h1>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => (window as any).aistudio?.openSelectKey?.()}
            className="bg-slate-900 text-white px-5 py-2 rounded-xl text-sm font-black shadow-lg hover:bg-black transition-all"
          >
            🔑 設定金鑰
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto py-12 px-6">
        {step === 'welcome' && (
          <div className="wizard-card text-center py-20 bg-white rounded-[4rem] shadow-xl border border-slate-100 px-10">
            <div className="text-9xl mb-10 filter drop-shadow-xl">🧙‍♂️</div>
            <h2 className="text-5xl md:text-6xl font-black text-slate-900 mb-8 leading-tight">讓資源班數學<br/><span className="text-blue-600 italic">變簡單了！</span></h2>
            <p className="text-xl md:text-2xl text-slate-400 mb-16 font-bold max-w-2xl mx-auto leading-relaxed">
              專為特教老師打造。選擇版本、單元，<br/>
              一鍵生成符合需求的精美講義與隨堂卷。
            </p>
            <button 
              onClick={() => setStep('publisher')}
              className="bg-blue-600 text-white px-12 py-7 rounded-[2.5rem] text-2xl font-black shadow-2xl hover:bg-blue-700 hover:scale-105 transition-all active:scale-95"
            >
              開始施放魔法 ➔
            </button>
          </div>
        )}

        {step === 'publisher' && (
          <div className="wizard-card">
            <h2 className="text-4xl font-black text-slate-800 mb-12 text-center tracking-tight">請選擇教材出版社</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {['康軒', '南一', '翰林'].map(p => (
                <button 
                  key={p}
                  onClick={() => {
                    setParams({ ...params, publisher: p as any });
                    setStep('grade');
                  }}
                  className="bg-white group p-12 rounded-[3.5rem] shadow-sm border-4 border-transparent hover:border-blue-500 hover:shadow-2xl transition-all"
                >
                  <div className="text-7xl mb-6 group-hover:scale-110 transition-transform">📖</div>
                  <div className="text-3xl font-black text-slate-700">{p}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'grade' && (
          <div className="wizard-card max-w-2xl mx-auto">
            <h2 className="text-4xl font-black text-slate-800 mb-10 text-center tracking-tight">選擇年級與學期</h2>
            <div className="bg-white p-10 rounded-[3.5rem] shadow-xl border border-slate-100">
              <div className="grid grid-cols-2 gap-3 mb-6">
                {['一年級', '二年級', '三年級', '四年級', '五年級', '六年級'].map(g => (
                  <button 
                    key={g}
                    onClick={() => setParams({...params, grade: g as any})}
                    className={`py-4 rounded-2xl font-black text-lg border-4 transition-all ${params.grade === g ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100'}`}
                  >
                    {g}
                  </button>
                ))}
              </div>
              <div className="flex gap-3 mb-10">
                {['上', '下'].map(s => (
                  <button 
                    key={s}
                    onClick={() => setParams({...params, semester: s as any})}
                    className={`flex-1 py-4 rounded-2xl font-black text-lg border-4 transition-all ${params.semester === s ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-50 border-transparent text-slate-400'}`}
                  >
                    {s}學期
                  </button>
                ))}
              </div>
              <button 
                onClick={handleFetchLibrary}
                className="w-full bg-slate-900 text-white py-6 rounded-[2rem] text-xl font-black shadow-xl hover:bg-black transition-all"
              >
                尋找對應章節 ➔
              </button>
            </div>
          </div>
        )}

        {step === 'library' && (
          <div className="wizard-card">
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                {params.publisher} {params.grade}{params.semester} 目錄
              </h2>
              <button onClick={() => setStep('grade')} className="text-slate-400 font-bold hover:text-slate-600 transition-colors">← 返回修改設定</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {chapters.length > 0 ? chapters.map(c => (
                <div key={c.id} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200 hover:border-blue-200 transition-colors">
                  <h3 className="text-2xl font-black text-slate-800 mb-6 flex items-start gap-3">
                    <span className="text-blue-500">#{c.id}</span>
                    <span>{c.title}</span>
                  </h3>
                  <div className="space-y-2">
                    {c.subChapters.map((sub, idx) => (
                      <button 
                        key={idx}
                        onClick={() => handleGenerateHandout(c.title, sub)}
                        className="w-full text-left p-4 rounded-xl font-bold text-slate-500 hover:bg-blue-50 hover:text-blue-700 transition-all flex justify-between items-center group"
                      >
                        <span className="truncate pr-2">{sub}</span>
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity">🪄</span>
                      </button>
                    ))}
                  </div>
                </div>
              )) : (
                <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border-4 border-dashed border-slate-100">
                  <p className="text-slate-300 text-2xl font-black italic">未搜尋到目錄內容，請嘗試重新設定...</p>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 'display' && activeContent && (
          <div className="wizard-card space-y-10">
            <div className="no-print flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200 gap-4">
              <div className="flex gap-3">
                <button onClick={() => setStep('library')} className="px-6 py-2.5 rounded-xl font-black text-slate-500 hover:bg-slate-50 border border-slate-200">← 目錄</button>
                {activeContent.type === 'handout' && (
                  <button 
                    onClick={handleGenerateHomework}
                    className="bg-orange-500 text-white px-8 py-2.5 rounded-xl font-black shadow-lg hover:bg-orange-600 transition-all"
                  >
                    生成對應隨堂卷 ➔
                  </button>
                )}
              </div>
              <button 
                onClick={() => window.print()}
                className="bg-slate-900 text-white px-10 py-2.5 rounded-xl font-black shadow-xl hover:bg-black transition-all"
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

      <footer className="no-print py-20 text-center text-slate-300 font-bold tracking-widest text-xs uppercase">
        資源班教學助手 • 用科技傳遞溫暖
      </footer>
    </div>
  );
};

export default App;