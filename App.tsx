import React, { useState, useEffect } from 'react';
import { SelectionParams, Chapter, HandoutContent, HomeworkContent, HomeworkConfig } from './types.ts';
import { fetchChapters, generateHandoutFromText, generateHomework } from './services/geminiService.ts';
import SelectionForm from './components/SelectionForm.tsx';
import ChapterSelector from './components/ChapterSelector.tsx';
import HandoutViewer from './components/HandoutViewer.tsx';
import HomeworkViewer from './components/HomeworkViewer.tsx';
import HomeworkConfigSection from './components/HomeworkConfigSection.tsx';
import ManualUnitInput from './components/ManualUnitInput.tsx';

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState<SelectionParams | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [handout, setHandout] = useState<HandoutContent | null>(null);
  const [homework, setHomework] = useState<HomeworkContent | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<{chapter: string, sub: string} | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'handout' | 'homework'>('handout');
  const [isSidebarVisible, setIsSidebarVisible] = useState(window.innerWidth > 1024);
  const [hasTriedFetch, setHasTriedFetch] = useState(false);

  useEffect(() => {
    // 確保 App 掛載後遮罩消失
    if ((window as any).hideLoadingOverlay) {
      setTimeout((window as any).hideLoadingOverlay, 500);
    }
  }, []);

  const handleParamsSubmit = async (newParams: SelectionParams) => {
    setLoading(true);
    setError(null);
    setParams(newParams);
    setHandout(null);
    setHomework(null);
    setChapters([]);
    setHasTriedFetch(false);
    
    try {
      const data = await fetchChapters(newParams);
      setChapters(data);
      if (data.length === 0) {
        setError("目前無法自動搜尋目錄。請直接在下方「手動輸入」單元名稱製作講義。");
      }
    } catch (err: any) {
      console.error(err);
      setError("服務連線超時，請嘗試直接「手動輸入」單元名稱。");
    } finally {
      setLoading(false);
      setHasTriedFetch(true);
    }
  };

  const handleGenerateHandout = async (chapterTitle: string, subChapter: string) => {
    setLoading(true);
    setError(null);
    setSelectedUnit({ chapter: chapterTitle, sub: subChapter });
    setViewMode('handout');
    setHomework(null);
    try {
      const content = await generateHandoutFromText(params!, chapterTitle, subChapter);
      setHandout(content);
      // 滾動到頂部
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError("製作講義時發生錯誤，請重新點擊嘗試。");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateHomework = async (config: HomeworkConfig) => {
    setLoading(true);
    setViewMode('homework');
    try {
      const content = await generateHomework(params!, selectedUnit!.chapter, selectedUnit!.sub, config);
      setHomework(content);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError("製作練習卷失敗。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen transition-all duration-500 pb-20 ${isSidebarVisible ? 'pl-0' : 'pl-0'}`}>
      {/* 頂部標題 */}
      <header className="py-8 px-4 text-center no-print">
        <h1 className="text-4xl md:text-5xl font-black text-blue-900 mb-2 drop-shadow-sm">✨ 數字小魔手</h1>
        <p className="text-slate-500 font-bold text-lg">資源班數學魔法屋 ‧ 專業講義產生器</p>
      </header>

      <div className={`container mx-auto px-4 grid grid-cols-1 ${isSidebarVisible ? 'lg:grid-cols-12' : 'lg:grid-cols-1'} gap-8`}>
        {/* 左側選單 */}
        {isSidebarVisible && (
          <aside className="lg:col-span-4 space-y-6 no-print">
            <SelectionForm onSubmit={handleParamsSubmit} isLoading={loading} />
            
            {chapters.length > 0 && (
              <ChapterSelector chapters={chapters} onSelect={handleGenerateHandout} isLoading={loading} />
            )}
            
            {error && (
              <div className="p-5 bg-rose-50 text-rose-600 rounded-2xl font-bold text-sm border-2 border-rose-100 animate-pulse">
                ⚠️ {error}
              </div>
            )}

            {!loading && (hasTriedFetch || chapters.length > 0 || error) && (
              <ManualUnitInput onGenerate={handleGenerateHandout} isLoading={loading} />
            )}
          </aside>
        )}

        {/* 右側主內容區 */}
        <main className={`${isSidebarVisible ? 'lg:col-span-8' : 'w-full'} transition-all`}>
          <div className="flex flex-wrap items-center gap-3 mb-6 no-print">
            <button 
              onClick={() => setIsSidebarVisible(!isSidebarVisible)} 
              className="bg-white border-2 border-slate-200 text-slate-700 px-5 py-2.5 rounded-2xl text-sm font-black shadow-sm active:scale-95 transition-all hover:bg-slate-50 flex items-center gap-2"
            >
              {isSidebarVisible ? '👈 隱藏側欄' : '👉 展開選單'}
            </button>
            
            {(handout || homework) && (
              <div className="flex bg-slate-100 rounded-2xl p-1 shadow-inner">
                <button 
                  onClick={() => setViewMode('handout')} 
                  className={`px-8 py-2 rounded-xl text-sm font-black transition-all ${viewMode === 'handout' ? 'bg-white text-blue-600 shadow-md scale-105' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  📖 核心講義
                </button>
                <button 
                  onClick={() => setViewMode('homework')} 
                  className={`px-8 py-2 rounded-xl text-sm font-black transition-all ${viewMode === 'homework' ? 'bg-white text-rose-600 shadow-md scale-105' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  📝 練習卷
                </button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="min-h-[600px] flex flex-col items-center justify-center bg-white rounded-[3rem] border-2 border-slate-100 shadow-xl p-12 text-center animate-in fade-in zoom-in duration-500">
              <div className="relative w-24 h-24 mb-10">
                <div className="absolute inset-0 border-8 border-blue-100 rounded-full"></div>
                <div className="absolute inset-0 border-8 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h2 className="text-4xl font-black text-slate-800 mb-4">🪄 魔法施展中...</h2>
              <p className="text-xl text-slate-400 font-bold max-w-md">我們正在為孩子準備最適合的數學內容，請稍候片刻</p>
            </div>
          ) : viewMode === 'handout' && handout ? (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
              <HandoutViewer content={handout} params={params!} />
              <div className="no-print">
                <HomeworkConfigSection onGenerate={handleGenerateHomework} isLoading={loading} />
              </div>
            </div>
          ) : viewMode === 'homework' && homework ? (
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
              <HomeworkViewer content={homework} params={params!} />
            </div>
          ) : (
            <div className="min-h-[600px] flex flex-col items-center justify-center bg-white/50 rounded-[3rem] border-4 border-dashed border-slate-200 text-slate-300 p-12 text-center">
              <div className="text-9xl mb-10 opacity-10">📐</div>
              <h3 className="text-2xl font-black text-slate-400">尚未產生教材</h3>
              <p className="text-lg font-bold mt-2">請先從左側選擇出版社、年級與單元</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;