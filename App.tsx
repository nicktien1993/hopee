
import React, { useState, useEffect, useCallback } from 'react';
import { SelectionParams, Chapter, HandoutContent, HomeworkContent, HomeworkConfig } from './types';
import { fetchChapters, generateHandoutFromText, generateHomework } from './services/geminiService';
import SelectionForm from './components/SelectionForm';
import ChapterSelector from './components/ChapterSelector';
import HandoutViewer from './components/HandoutViewer';
import HomeworkViewer from './components/HomeworkViewer';
import HomeworkConfigSection from './components/HomeworkConfigSection';
import ManualUnitInput from './components/ManualUnitInput';

const LOADING_MESSAGES = [
  "正在施展數學小魔法...",
  "正在把大題目切成小塊...",
  "正在拆解步驟，讓孩子更好懂...",
  "老師辛苦了，魔法講義馬上就到！",
  "正在召喚數字小精靈...",
  "正在為孩子打造魔法檢核清單..."
];

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [params, setParams] = useState<SelectionParams | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [handout, setHandout] = useState<HandoutContent | null>(null);
  const [homework, setHomework] = useState<HomeworkContent | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<{chapter: string, sub: string} | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'handout' | 'homework'>('handout');
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [hasTriedFetch, setHasTriedFetch] = useState(false);

  useEffect(() => {
    let interval: number;
    if (loading) {
      interval = window.setInterval(() => {
        setLoadingMsgIdx(prev => (prev + 1) % LOADING_MESSAGES.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleError = async (err: any) => {
    console.error("Gemini API Error:", err);
    setLoading(false); // 發生錯誤時一定要關閉載入中
    
    const errorMsg = err?.message || "";
    if (errorMsg.includes("Requested entity") || errorMsg.includes("API_KEY") || errorMsg.includes("key")) {
      setError("偵測到 API 設定問題。如果您是第一次在這台電腦使用，請點擊下方按鈕重新選取金鑰。");
    } else {
      setError("連線超時或網路不穩。如果「查詢目錄」太慢，請直接使用「手動輸入單元」更快。");
    }
  };

  const handleParamsSubmit = async (newParams: SelectionParams) => {
    setLoading(true);
    setError(null);
    setParams(newParams);
    setHandout(null);
    setHomework(null);
    setChapters([]);
    setSelectedUnit(null);
    setHasTriedFetch(false);
    
    try {
      const data = await fetchChapters(newParams);
      if (data.length === 0) {
        setError("無法取得目錄。這通常是網路阻塞，建議直接在左下方「手動輸入」單元名稱。");
      }
      setChapters(data);
    } catch (err) {
      await handleError(err);
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
      await handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateHomework = async (config: HomeworkConfig) => {
    setLoading(true);
    setError(null);
    setViewMode('homework');
    try {
      const content = await generateHomework(params!, selectedUnit!.chapter, selectedUnit!.sub, config);
      setHomework(content);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      await handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setParams(null);
    setChapters([]);
    setHandout(null);
    setHomework(null);
    setSelectedUnit(null);
    setError(null);
    setIsSidebarVisible(true);
    setHasTriedFetch(false);
  };

  return (
    <div className={`mx-auto px-4 py-8 transition-all duration-500 ease-in-out ${isSidebarVisible ? 'max-w-6xl' : 'max-w-[98%]'}`}>
      <header className="mb-10 text-center no-print relative">
        <h1 className="text-4xl font-black text-blue-900 mb-3 tracking-tight">✨ 數字小魔手：資源班數學魔法屋</h1>
        <p className="text-slate-500 font-bold italic">讓數學變好玩、變簡單的秘密基地</p>
        {(params || handout) && (
          <button onClick={resetAll} className="absolute right-0 top-0 text-slate-400 hover:text-rose-500 font-bold text-sm transition flex items-center gap-1">
            🔄 重新開始
          </button>
        )}
      </header>

      <div className={`grid grid-cols-1 ${isSidebarVisible ? 'lg:grid-cols-12' : 'lg:grid-cols-1'} gap-8 no-print items-start`}>
        {isSidebarVisible && (
          <div className="lg:col-span-4 space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
            <SelectionForm onSubmit={handleParamsSubmit} isLoading={loading} />
            
            {chapters.length > 0 && (
              <ChapterSelector chapters={chapters} onSelect={handleGenerateHandout} isLoading={loading} />
            )}

            {error && (
              <div className="p-5 bg-rose-50 border-2 border-rose-200 text-rose-700 rounded-2xl text-sm font-bold shadow-sm space-y-3">
                <p>⚠️ {error}</p>
                <button onClick={() => window.aistudio?.openSelectKey?.()} className="w-full py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition">
                  🔑 點我重新選取 API 金鑰
                </button>
              </div>
            )}

            {!loading && (hasTriedFetch || chapters.length > 0 || error) && (
              <ManualUnitInput onGenerate={handleGenerateHandout} isLoading={loading} />
            )}
          </div>
        )}

        <div className={`${isSidebarVisible ? 'lg:col-span-8' : 'w-full'} transition-all duration-500 relative`}>
          <div className="flex justify-between items-end mb-4 no-print">
            <div className="flex gap-2">
              <button onClick={() => setIsSidebarVisible(!isSidebarVisible)} className="bg-white border-2 border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-sm font-black shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2 mb-1 active:scale-95">
                {isSidebarVisible ? '👈 隱藏選單' : '👉 顯示選單'}
              </button>

              {(handout || homework) && (
                <>
                  <button onClick={() => setViewMode('handout')} className={`px-8 py-3 rounded-t-2xl font-black transition-all ${viewMode === 'handout' ? 'bg-white border-x border-t border-slate-200 text-blue-700 shadow-[0_-4px_10px_-5px_rgba(0,0,0,0.1)]' : 'text-slate-400 hover:text-slate-600 pb-2 bg-slate-100/50'}`}>
                    📖 核心講義
                  </button>
                  {homework && (
                    <button onClick={() => setViewMode('homework')} className={`px-8 py-3 rounded-t-2xl font-black transition-all ${viewMode === 'homework' ? 'bg-white border-x border-t border-slate-200 text-rose-700 shadow-[0_-4px_10px_-5px_rgba(0,0,0,0.1)]' : 'text-slate-400 hover:text-slate-600 pb-2 bg-slate-100/50'}`}>
                      🎯 隨堂練習
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-[600px] bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="relative w-32 h-32 mb-8">
                <div className="absolute inset-0 border-8 border-blue-50 rounded-full"></div>
                <div className="absolute inset-0 border-8 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center text-4xl shadow-inner">🪄</div>
              </div>
              <p className="text-slate-800 font-black text-3xl mb-4 text-center px-4">
                {LOADING_MESSAGES[loadingMsgIdx]}
              </p>
              <p className="text-blue-500 text-lg font-bold">小魔法師正在努力中...</p>
            </div>
          ) : viewMode === 'handout' && handout ? (
            <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
              <HandoutViewer content={handout} params={params!} />
              <div className="no-print">
                <HomeworkConfigSection onGenerate={handleGenerateHomework} isLoading={loading} />
              </div>
            </div>
          ) : viewMode === 'homework' && homework ? (
            <div className="animate-in fade-in zoom-in-95 duration-500">
              <HomeworkViewer content={homework} params={params!} />
              <div className="mt-8 flex justify-center no-print">
                <button onClick={() => setViewMode('handout')} className="bg-slate-200 text-slate-700 px-6 py-2 rounded-full font-bold hover:bg-slate-300 transition">
                  ← 返回查看講義
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[600px] bg-white rounded-3xl shadow-sm border border-slate-200 border-dashed p-12 text-center">
              <div className="text-8xl mb-8 grayscale hover:grayscale-0 transition-all duration-500 cursor-default">🪄</div>
              <h3 className="text-2xl font-black text-slate-700 mb-4">歡迎來到魔法屋！</h3>
              <p className="text-slate-500 font-medium">請從左側開啟你的數學冒險，或者直接施展「手動輸入」咒語。</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
