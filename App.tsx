import React, { useState, useEffect } from 'react';
import { SelectionParams, Chapter, HandoutContent, HomeworkContent, HomeworkConfig } from './types.ts';
import { fetchChapters, generateHandoutFromText, generateHomework } from './services/geminiService.ts';
import SelectionForm from './components/SelectionForm.tsx';
import HandoutViewer from './components/HandoutViewer.tsx';
import HomeworkViewer from './components/HomeworkViewer.tsx';
import HomeworkConfigSection from './components/HomeworkConfigSection.tsx';
import ManualUnitInput from './components/ManualUnitInput.tsx';

const App: React.FC = () => {
  // 確保遮罩被移除
  useEffect(() => {
    const timer = setTimeout(() => {
      if ((window as any).hideLoadingOverlay) {
        (window as any).hideLoadingOverlay();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

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
  const [error, setError] = useState<{msg: string, type: 'permission' | 'general'} | null>(null);
  const [viewMode, setViewMode] = useState<'library' | 'handout' | 'homework'>('library');

  // 初始化緩存
  useEffect(() => {
    const cached = localStorage.getItem('magic_handout_toc');
    if (cached) {
      try {
        const { params: p, data } = JSON.parse(cached);
        setParams(p);
        setChapters(data);
      } catch (e) {
        localStorage.removeItem('magic_handout_toc');
      }
    }
  }, []);

  const handleApiError = (err: any) => {
    const msg = err.message || "";
    if (msg.includes("permission denied") || msg.includes("403")) {
      setError({ 
        msg: "金鑰權限不足以執行「雲端搜尋」功能。請更換金鑰，或使用下方「手動輸入」功能製作單元。", 
        type: 'permission' 
      });
    } else {
      setError({ msg: "魔法稍微失靈了：" + msg, type: 'general' });
    }
  };

  const handleFetchFullLibrary = async (newParams: SelectionParams) => {
    setLoading(true);
    setError(null);
    setParams(newParams);
    try {
      const data = await fetchChapters(newParams);
      if (data && data.length > 0) {
        setChapters(data);
        localStorage.setItem('magic_handout_toc', JSON.stringify({ params: newParams, data }));
        setViewMode('library');
      } else {
        setError({ msg: "找不到目錄，請嘗試手動輸入單元名稱。", type: 'general' });
      }
    } catch (err: any) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateHandout = async (chapterTitle: string, subChapter: string) => {
    setLoading(true);
    setError(null);
    setSelectedUnit({ chapter: chapterTitle, sub: subChapter });
    try {
      const content = await generateHandoutFromText(params, chapterTitle, subChapter);
      setHandout(content);
      setViewMode('handout');
      setHomework(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateHomework = async (config: HomeworkConfig) => {
    if (!selectedUnit) return;
    setLoading(true);
    setError(null);
    try {
      const content = await generateHomework(params, selectedUnit.chapter, selectedUnit.sub, config);
      setHomework(content);
      setViewMode('homework');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col overflow-hidden">
      <header className="bg-white border-b border-slate-200 py-4 px-8 flex justify-between items-center no-print sticky top-0 z-40 shadow-sm shrink-0">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setViewMode('library')}>
          <span className="text-3xl">✨</span>
          <div>
            <h1 className="text-xl font-black text-slate-900 leading-tight">數字小魔手</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">特教數學魔法屋</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          {viewMode !== 'library' && (
            <button 
              onClick={() => setViewMode('library')}
              className="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl text-sm font-black hover:bg-white border border-slate-200 transition-all"
            >
              📂 回到地圖
            </button>
          )}

          <button 
            onClick={() => (window as any).aistudio?.openSelectKey?.()}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-black shadow-md hover:bg-blue-700 transition-all"
          >
            🔑 金鑰設定
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-80 overflow-y-auto no-print bg-white border-r border-slate-200 p-6 space-y-8 shrink-0 hidden lg:block">
          <SelectionForm initialParams={params} onSubmit={handleFetchFullLibrary} isLoading={loading} />
          
          <div className="pt-4 border-t border-slate-100">
            <ManualUnitInput onGenerate={handleGenerateHandout} isLoading={loading} />
          </div>

          {error && (
            <div className={`p-5 rounded-[2rem] text-xs font-bold border-2 ${error.type === 'permission' ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-rose-50 border-rose-200 text-rose-600'}`}>
              <p className="mb-2">⚠️ {error.msg}</p>
              {error.type === 'permission' && (
                <button 
                  onClick={() => (window as any).aistudio?.openSelectKey?.()}
                  className="w-full py-2 bg-amber-600 text-white rounded-xl mt-2 shadow-sm font-black"
                >
                  更換金鑰
                </button>
              )}
            </div>
          )}
        </aside>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth">
          <div className="max-w-5xl mx-auto">
            {loading ? (
              <div className="h-[60vh] flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 border-[10px] border-blue-50 border-t-blue-600 rounded-full animate-spin mb-8"></div>
                <h2 className="text-3xl font-black text-slate-800">正在召喚數學魔法...</h2>
                <p className="text-slate-400 mt-3 font-bold italic text-lg">這需要一點咒語時間，請稍候 🪄</p>
              </div>
            ) : viewMode === 'library' ? (
              <div className="space-y-8">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-10 rounded-[3rem] text-white shadow-xl mb-12">
                  <h2 className="text-5xl font-black mb-3">教材地圖</h2>
                  <p className="font-bold opacity-90 text-xl">{params.year}學年度 • {params.publisher} • {params.grade}{params.semester}</p>
                </div>

                {chapters.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {chapters.map((chapter) => (
                      <div key={chapter.id} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                        <span className="bg-blue-100 text-blue-700 font-black px-4 py-1.5 rounded-full text-xs mb-6 inline-block uppercase tracking-wider">單元 {chapter.id}</span>
                        <h3 className="text-2xl font-black text-slate-800 mb-8 h-16 overflow-hidden leading-snug">{chapter.title}</h3>
                        <div className="space-y-2 border-t pt-6 border-slate-50">
                          {chapter.subChapters.map((sub, idx) => (
                            <button 
                              key={idx}
                              onClick={() => handleGenerateHandout(chapter.title, sub)}
                              className="w-full text-left p-4 rounded-2xl text-base font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-700 group flex items-center justify-between transition-all"
                            >
                              <span className="truncate flex-1">{sub}</span>
                              <span className="opacity-0 group-hover:opacity-100 text-2xl">🪄</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-[4rem] p-32 text-center border-4 border-dashed border-slate-200 shadow-inner">
                    <span className="text-9xl mb-8 block">📖</span>
                    <h3 className="text-3xl font-black text-slate-400">魔法圖書館空空如也</h3>
                    <p className="text-slate-300 font-bold mt-4 text-xl">請在左側選擇版本並點擊「載入全冊目錄」！</p>
                    <div className="lg:hidden mt-12 max-w-sm mx-auto space-y-8">
                      <SelectionForm initialParams={params} onSubmit={handleFetchFullLibrary} isLoading={loading} />
                      <div className="pt-4 border-t border-slate-100">
                        <ManualUnitInput onGenerate={handleGenerateHandout} isLoading={loading} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : viewMode === 'handout' && handout ? (
              <div className="space-y-16 pb-20">
                <HandoutViewer content={handout} params={params} />
                <div className="no-print">
                  <HomeworkConfigSection onGenerate={handleGenerateHomework} isLoading={loading} />
                </div>
              </div>
            ) : viewMode === 'homework' && homework ? (
              <div className="pb-20">
                <HomeworkViewer content={homework} params={params} />
              </div>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;