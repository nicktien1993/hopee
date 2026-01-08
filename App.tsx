import React, { useState, useEffect } from 'react';
import { SelectionParams, Chapter, HandoutContent, HomeworkContent, HomeworkConfig } from './types';
import { fetchChapters, generateHandoutFromText, generateHomework } from './services/geminiService';
import SelectionForm from './components/SelectionForm';
import ChapterSelector from './components/ChapterSelector';
import HandoutViewer from './components/HandoutViewer';
import HomeworkViewer from './components/HomeworkViewer';
import HomeworkConfigSection from './components/HomeworkConfigSection';
import ManualUnitInput from './components/ManualUnitInput';

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

  // 確保載入時隱藏原生 overlay
  useEffect(() => {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
      setTimeout(() => {
        overlay.style.opacity = '0';
        setTimeout(() => overlay.remove(), 500);
      }, 1000);
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
        setError("目前無法自動搜尋目錄（可能是網路連線問題）。請直接在下方「手動輸入」單元名稱製作講義。");
      }
    } catch (err: any) {
      console.error(err);
      setError("連線不穩定，請嘗試直接「手動輸入」單元名稱製作。");
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
    } catch (err) {
      setError("製作講義時發生錯誤，請檢查網路後重新嘗試。");
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
    <div className={`mx-auto px-4 py-8 transition-all duration-500 ${isSidebarVisible ? 'max-w-6xl' : 'max-w-full'}`}>
      <header className="mb-10 text-center no-print relative">
        <h1 className="text-4xl font-black text-blue-900 mb-3">✨ 數字小魔手：資源班數學魔法屋</h1>
        <p className="text-slate-500 font-bold italic">專業、視覺化的數學教學講義產生器</p>
      </header>

      <div className={`grid grid-cols-1 ${isSidebarVisible ? 'lg:grid-cols-12' : 'lg:grid-cols-1'} gap-8 no-print`}>
        {isSidebarVisible && (
          <div className="lg:col-span-4 space-y-6 animate-in slide-in-from-left duration-500">
            <SelectionForm onSubmit={handleParamsSubmit} isLoading={loading} />
            {chapters.length > 0 && <ChapterSelector chapters={chapters} onSelect={handleGenerateHandout} isLoading={loading} />}
            {error && <div className="p-4 bg-rose-50 text-rose-600 rounded-xl font-bold text-sm border border-rose-100 mb-4 shadow-sm">{error}</div>}
            {!loading && (hasTriedFetch || chapters.length > 0 || error) && <ManualUnitInput onGenerate={handleGenerateHandout} isLoading={loading} />}
          </div>
        )}

        <div className={`${isSidebarVisible ? 'lg:col-span-8' : 'w-full'} transition-all duration-500`}>
          <div className="flex gap-2 mb-4 no-print items-center justify-between">
            <button onClick={() => setIsSidebarVisible(!isSidebarVisible)} className="bg-white border-2 border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-sm font-black shadow-sm active:scale-95 hover:bg-slate-50 transition-all">
              {isSidebarVisible ? '👈 隱藏選單' : '👉 顯示選單'}
            </button>
            {(handout || homework) && (
              <div className="flex bg-slate-200 rounded-xl p-1 shadow-inner">
                <button onClick={() => setViewMode('handout')} className={`px-6 py-1.5 rounded-lg text-sm font-black transition ${viewMode === 'handout' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>核心講義</button>
                <button onClick={() => setViewMode('homework')} className={`px-6 py-1.5 rounded-lg text-sm font-black transition ${viewMode === 'homework' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500'}`}>隨堂練習</button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="h-[600px] flex flex-col items-center justify-center bg-white rounded-[3rem] border-2 border-slate-100 shadow-sm animate-pulse">
              <div className="w-16 h-16 border-8 border-blue-600 border-t-transparent rounded-full animate-spin mb-8"></div>
              <p className="text-3xl font-black text-slate-800">正在施展數學魔法...</p>
              <p className="text-slate-400 mt-4 font-bold">這可能需要 5-10 秒鐘時間</p>
            </div>
          ) : viewMode === 'handout' && handout ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <HandoutViewer content={handout} params={params!} />
              <div className="no-print"><HomeworkConfigSection onGenerate={handleGenerateHomework} isLoading={loading} /></div>
            </div>
          ) : viewMode === 'homework' && homework ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <HomeworkViewer content={homework} params={params!} />
            </div>
          ) : (
            <div className="h-[600px] flex flex-col items-center justify-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200 text-slate-400 group">
              <span className="text-8xl mb-8 opacity-20 group-hover:opacity-40 transition-opacity duration-500">🪄</span>
              <p className="text-xl font-bold">請先從左側選擇出版社與年級</p>
              <p className="text-sm mt-2 opacity-50">確認設定後魔法就會開始！</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;