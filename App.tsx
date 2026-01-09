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
  const [error, setError] = useState<{msg: string, type: 'key' | 'general'} | null>(null);
  const [viewMode, setViewMode] = useState<'handout' | 'homework'>('handout');
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  useEffect(() => {
    if ((window as any).hideLoadingOverlay) {
      setTimeout((window as any).hideLoadingOverlay, 500);
    }
  }, []);

  const handleKeyError = async (err: any) => {
    const errMsg = err.message || "";
    if (errMsg.includes("403") || errMsg.includes("PERMISSION_DENIED")) {
      setError({
        msg: "這項功能（自動查目錄）需要付費 API 金鑰。別擔心，您可以直接在下方「手動輸入」單元名稱，那是不需要付費的！",
        type: 'key'
      });
    } else {
      setError({ msg: "魔法稍微失靈了：" + errMsg, type: 'general' });
    }
  };

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
        setError({ msg: "找不到目錄，請試試看直接在下方輸入單元名稱！", type: 'general' });
      }
    } catch (err: any) {
      console.error(err);
      await handleKeyError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateHandout = async (chapterTitle: string, subChapter: string) => {
    setLoading(true);
    setError(null);
    setSelectedUnit({ chapter: chapterTitle, sub: subChapter });
    setViewMode('handout');
    setHomework(null);
    
    // 如果沒有先選設定，給予預設值以免當機
    const currentParams = params || {
      year: '114',
      publisher: '康軒',
      grade: '一年級',
      semester: '上',
      difficulty: '易'
    } as SelectionParams;

    try {
      const content = await generateHandoutFromText(currentParams, chapterTitle, subChapter);
      setHandout(content);
      if (window.innerWidth < 1024) setIsSidebarVisible(false);
    } catch (err: any) {
      await handleKeyError(err);
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
    } catch (err: any) {
      await handleKeyError(err);
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
            <p className="text-sm font-bold text-slate-400">特教資源班數學魔法講義</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => (window as any).aistudio?.openSelectKey?.()}
            className="no-print bg-slate-100 text-slate-600 px-4 py-2 rounded-xl text-xs font-black border border-slate-200 hover:bg-white transition-colors"
          >
            🔑 設定金鑰 (非必備)
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className={`${isSidebarVisible ? 'w-full lg:w-96' : 'w-0'} transition-all duration-300 overflow-y-auto no-print bg-white border-r border-slate-200`}>
          <div className="p-6 space-y-8 min-w-[320px]">
            <SelectionForm onSubmit={handleParamsSubmit} isLoading={loading} />
            
            {error && (
              <div className={`p-4 rounded-xl text-sm font-bold border ${error.type === 'key' ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-rose-50 border-rose-200 text-rose-600'}`}>
                {error.type === 'key' ? '💡 小提示：' : '⚠️ '} {error.msg}
              </div>
            )}

            {chapters.length > 0 && (
              <ChapterSelector chapters={chapters} onSelect={handleGenerateHandout} isLoading={loading} />
            )}
            
            <ManualUnitInput onGenerate={handleGenerateHandout} isLoading={loading} />
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-4 lg:p-10">
          <div className="max-w-4xl mx-auto">
            {loading ? (
              <div className="h-96 flex flex-col items-center justify-center space-y-6">
                <div className="w-16 h-16 border-8 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                <h2 className="text-2xl font-black text-slate-800">🪄 魔法正在編織講義中...</h2>
              </div>
            ) : viewMode === 'handout' && handout ? (
              <div className="space-y-12">
                <HandoutViewer content={handout} params={params || {year:'114', publisher:'康軒', grade:'一年級', semester:'上', difficulty:'易'}} />
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
                <p className="text-xl font-bold text-center leading-relaxed">
                  想要製作什麼單元呢？<br/>
                  <span className="text-sm font-medium text-slate-400">在左側輸入「例如：分數的加法」<br/>立刻幫您產出具象化講義！</span>
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;