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
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  useEffect(() => {
    if ((window as any).hideLoadingOverlay) {
      setTimeout((window as any).hideLoadingOverlay, 500);
    }
  }, []);

  const handleParamsSubmit = async (newParams: SelectionParams) => {
    setLoading(true);
    setError(null);
    setParams(newParams);
    setChapters([]);
    try {
      const data = await fetchChapters(newParams);
      if (data && data.length > 0) {
        setChapters(data);
      } else {
        setError("找不目錄，建議使用下方「手動輸入」功能。");
      }
    } catch (err) {
      setError("無法連線至魔法圖書館，請手動輸入單元名稱。");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateHandout = async (chapterTitle: string, subChapter: string) => {
    setLoading(true);
    setSelectedUnit({ chapter: chapterTitle, sub: subChapter });
    setViewMode('handout');
    setHomework(null);
    try {
      const content = await generateHandoutFromText(params!, chapterTitle, subChapter);
      setHandout(content);
      if (window.innerWidth < 1024) setIsSidebarVisible(false);
    } catch (err) {
      setError("製作講義魔法失敗，請重新嘗試。");
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
    } catch (err) {
      setError("製作練習卷失敗。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b-2 border-slate-200 py-6 px-8 flex justify-between items-center no-print">
        <div className="flex items-center gap-3">
          <span className="text-4xl">✨</span>
          <div>
            <h1 className="text-2xl font-black text-slate-900">數字小魔手</h1>
            <p className="text-sm font-bold text-slate-400">資源班數學魔法講義產生器</p>
          </div>
        </div>
        <button 
          onClick={() => setIsSidebarVisible(!isSidebarVisible)}
          className="lg:hidden p-2 bg-slate-100 rounded-lg text-slate-600 font-bold"
        >
          {isSidebarVisible ? '收起設定' : '開啟設定'}
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* 左側：設定區 */}
        <aside className={`${isSidebarVisible ? 'w-full lg:w-96' : 'w-0'} transition-all duration-300 overflow-y-auto no-print bg-white border-r border-slate-200`}>
          <div className="p-6 space-y-8 min-w-[320px]">
            <SelectionForm onSubmit={handleParamsSubmit} isLoading={loading} />
            {chapters.length > 0 && (
              <ChapterSelector chapters={chapters} onSelect={handleGenerateHandout} isLoading={loading} />
            )}
            <ManualUnitInput onGenerate={handleGenerateHandout} isLoading={loading} />
            {error && <div className="p-4 bg-rose-50 text-rose-600 rounded-xl text-sm font-bold border border-rose-100">⚠️ {error}</div>}
          </div>
        </aside>

        {/* 右側：內容展示區 */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-10">
          <div className="max-w-4xl mx-auto">
            {loading ? (
              <div className="h-96 flex flex-col items-center justify-center space-y-6">
                <div className="w-16 h-16 border-8 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                <h2 className="text-2xl font-black text-slate-800">🪄 正在召喚數學知識...</h2>
              </div>
            ) : viewMode === 'handout' && handout ? (
              <div className="space-y-12">
                <HandoutViewer content={handout} params={params!} />
                <div className="no-print">
                  <HomeworkConfigSection onGenerate={handleGenerateHomework} isLoading={loading} />
                </div>
              </div>
            ) : viewMode === 'homework' && homework ? (
              <div className="space-y-6">
                <div className="no-print flex gap-4 mb-6">
                  <button onClick={() => setViewMode('handout')} className="bg-slate-200 text-slate-700 px-6 py-2 rounded-full font-bold">← 回到講義</button>
                </div>
                <HomeworkViewer content={homework} params={params!} />
              </div>
            ) : (
              <div className="h-[600px] flex flex-col items-center justify-center text-slate-300">
                <span className="text-8xl mb-6 opacity-20">📖</span>
                <p className="text-xl font-bold">請從左側選擇出版社與單元</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;