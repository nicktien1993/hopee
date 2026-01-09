import React, { useState } from 'react';
import { HandoutContent, SelectionParams, SpecialEdSettings } from '../types.ts';
import DrawingCanvas from './DrawingCanvas.tsx';

interface Props {
  content: HandoutContent;
  params: SelectionParams;
}

const HandoutViewer: React.FC<Props> = ({ content, params }) => {
  const [activeSteps, setActiveSteps] = useState<Record<number, number>>({}); 
  const [visibleAnswers, setVisibleAnswers] = useState<Record<string, boolean>>({});
  const [visibleCanvas, setVisibleCanvas] = useState<Record<string, boolean>>({});
  const [settings, setSettings] = useState<SpecialEdSettings>({
    showGrids: false,
    colorCoding: true,
    showArrows: false,
    showChecklist: true
  });
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});

  const examples = content.examples || [];
  const exercises = content.exercises || [];
  const checklist = content.checklist || [];

  const updateSetting = (key: keyof SpecialEdSettings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleAnswer = (key: string) => {
    setVisibleAnswers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleCanvas = (key: string) => {
    setVisibleCanvas(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const nextStep = (exIdx: number, maxSteps: number) => {
    const current = activeSteps[exIdx] || 0;
    if (current < maxSteps) {
      setActiveSteps({ ...activeSteps, [exIdx]: current + 1 });
    }
  };

  const resetSteps = (exIdx: number) => {
    setActiveSteps({ ...activeSteps, [exIdx]: 0 });
  };

  const highlightSymbols = (text: string) => {
    if (!text) return "";
    if (!settings.colorCoding) return text;
    return text.replace(/(\+|\-|\×|\÷|\=)/g, '<span class="text-rose-600 font-black px-2 mx-1">$1</span>');
  };

  return (
    <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-200 min-h-[600px] relative">
      <div className="no-print mb-8 bg-blue-50/50 p-6 rounded-2xl border border-blue-100 flex items-center justify-between">
        <div className="flex gap-4">
          <button onClick={() => updateSetting('colorCoding')} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 transition-all font-bold text-sm ${settings.colorCoding ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
            🎨 符號醒目色
          </button>
        </div>
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="bg-slate-900 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg hover:bg-slate-800 transition-all">🖨️ 列印講義</button>
        </div>
      </div>

      <div className="border-b-8 border-slate-800 pb-6 mb-12">
        <h1 className="text-5xl font-black text-slate-900 mb-4">{content.title}</h1>
        <p className="text-xl text-slate-500 font-bold mb-10">{params.year}學年度 {params.publisher} {params.grade} {params.semester}學期</p>
        <div className="flex gap-12 text-2xl font-bold border-t-4 pt-10 border-slate-100">
          <span>姓名：_______________</span>
          <span>得分：_______________</span>
        </div>
      </div>

      <section className="mb-20">
        <h2 className="text-3xl font-black bg-blue-100 text-blue-800 px-6 py-2.5 inline-block rounded-2xl mb-10 shadow-sm">💡 重點加油站</h2>
        <div className="text-3xl leading-[2.2] text-slate-800 pl-2 font-medium tracking-wide mb-10" dangerouslySetInnerHTML={{ __html: highlightSymbols(content.concept) }} />
        
        {content.visualAidSvg && (
          <div className="my-12 p-10 bg-slate-50 rounded-[3rem] border-2 border-slate-100 flex justify-center overflow-hidden">
            <div className="w-full max-w-2xl" dangerouslySetInnerHTML={{ __html: content.visualAidSvg }} />
          </div>
        )}
      </section>

      <section className="mb-20">
        <h2 className="text-3xl font-black bg-emerald-100 text-emerald-800 px-6 py-2.5 inline-block rounded-2xl mb-10 shadow-sm">✍️ 跟我練習做</h2>
        <div className="space-y-20 pl-2">
          {examples.map((ex, i) => (
            <div key={i} className="bg-slate-50/50 p-12 rounded-[3.5rem] border-2 border-slate-200">
              <div className="flex justify-between items-start mb-10 min-w-0">
                <p className="font-black text-4xl text-blue-900 flex-1 mr-6 leading-relaxed" dangerouslySetInnerHTML={{ __html: `例題 ${i + 1}：${highlightSymbols(ex.question)}` }} />
                <button 
                  onClick={() => toggleCanvas(`ex-${i}`)}
                  className="no-print shrink-0 bg-white border-2 border-blue-200 text-blue-600 px-5 py-2.5 rounded-2xl text-sm font-black shadow-sm hover:bg-blue-50 transition-colors"
                >
                  {visibleCanvas[`ex-${i}`] ? '➖ 收合計算' : '✏️ 開啟計算'}
                </button>
              </div>

              {ex.visualAidSvg && (
                <div className="mb-12 p-8 bg-white rounded-[2.5rem] border border-slate-100 flex justify-center">
                  <div className="w-full max-w-xl" dangerouslySetInnerHTML={{ __html: ex.visualAidSvg }} />
                </div>
              )}
              
              <div className={`mb-10 print:hidden ${visibleCanvas[`ex-${i}`] ? 'block' : 'hidden'}`}>
                <DrawingCanvas id={`canvas-ex-${i}`} height={500} isVisible={visibleCanvas[`ex-${i}`]} />
              </div>

              <div className="space-y-10 mb-12">
                {(ex.stepByStep || []).map((step, si) => (
                  <div key={si} className={`flex items-start text-slate-700 transition-all duration-700 ${si < (activeSteps[i] || 0) || window.location.search.includes('print') ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8 pointer-events-none hidden print:flex'}`}>
                    <span className="bg-emerald-500 text-white font-black rounded-2xl min-w-[50px] h-[50px] flex items-center justify-center text-2xl shrink-0 mr-8 mt-2 shadow-md">{si + 1}</span>
                    <span className="text-3xl leading-[2.0] font-bold text-slate-700" dangerouslySetInnerHTML={{ __html: highlightSymbols(step) }} />
                  </div>
                ))}
              </div>
              
              <div className="no-print flex gap-4 mb-8">
                {(activeSteps[i] || 0) < (ex.stepByStep?.length || 0) ? (
                  <button onClick={() => nextStep(i, ex.stepByStep.length)} className="bg-emerald-600 text-white px-10 py-4 rounded-2xl font-black text-xl shadow-lg hover:bg-emerald-700 transition active:scale-95">👣 顯示下一步</button>
                ) : (
                  <button onClick={() => resetSteps(i)} className="bg-slate-400 text-white px-8 py-3 rounded-xl font-bold shadow-sm">🔄 重新開始</button>
                )}
              </div>
              
              <div className="mt-12 pt-10 border-t-4 border-dashed border-slate-200 flex items-center justify-end">
                <span className="text-4xl font-black mr-8 text-emerald-700 italic">答：</span>
                <div className={`min-w-[200px] text-right transition-all duration-300 ${visibleAnswers[`ex-${i}`] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
                  <span className="text-5xl font-black text-emerald-700 underline underline-offset-[16px] decoration-4">{ex.answer}</span>
                </div>
                <button onClick={() => toggleAnswer(`ex-${i}`)} className="no-print p-5 rounded-full bg-white border-2 border-emerald-100 text-amber-500 shadow-xl hover:bg-amber-50 transition active:scale-90 ml-8">💡</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-20">
        <h2 className="text-3xl font-black bg-amber-100 text-amber-800 px-6 py-2.5 inline-block rounded-2xl mb-10 shadow-sm">💪 我也會寫寫看</h2>
        <div className="space-y-32 pl-2 mt-12">
          {exercises.map((ex, i) => (
            <div key={i} className="border-b-4 border-dashed border-slate-100 pb-20 last:border-0 relative">
              <div className="flex justify-between items-start mb-10 min-w-0">
                <p className="text-4xl font-bold text-slate-800 flex-1 mr-6 leading-relaxed" dangerouslySetInnerHTML={{ __html: `練習 ${i + 1}：${highlightSymbols(ex.question)}` }} />
                <button 
                  onClick={() => toggleCanvas(`prac-${i}`)}
                  className="no-print shrink-0 bg-slate-50 border-2 border-slate-200 text-slate-600 px-5 py-2.5 rounded-2xl text-sm font-black shadow-sm hover:bg-slate-100 transition-colors"
                >
                  {visibleCanvas[`prac-${i}`] ? '➖ 收合計算' : '✏️ 開啟計算'}
                </button>
              </div>
              
              <div className={`mb-10 print:hidden ${visibleCanvas[`prac-${i}`] ? 'block' : 'hidden'}`}>
                <DrawingCanvas id={`canvas-prac-${i}`} height={600} isVisible={visibleCanvas[`prac-${i}`]} />
              </div>

              <div className="flex items-center justify-end mt-20">
                <span className="text-4xl font-bold mr-8 text-slate-300 italic">答：</span>
                <div className={`min-w-[200px] text-right transition-all duration-300 ${visibleAnswers[`prac-${i}`] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
                  <span className="text-5xl font-black text-blue-600 underline underline-offset-[16px] decoration-4">{ex.answer}</span>
                </div>
                <button onClick={() => toggleAnswer(`prac-${i}`)} className="no-print p-5 rounded-full bg-white border-2 border-slate-100 text-amber-500 shadow-lg ml-8 hover:bg-amber-50 transition active:scale-90">💡</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {settings.showChecklist && (
        <section className="mt-24 p-12 border-8 border-double border-blue-200 rounded-[4.5rem] bg-blue-50/10">
          <h3 className="text-4xl font-black text-blue-900 mb-10 flex items-center">📝 自我檢查：</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {checklist.map((item, idx) => (
              <label key={idx} className="flex items-center gap-8 bg-white p-8 rounded-[2.5rem] shadow-sm border-2 border-blue-50 cursor-pointer group hover:bg-blue-50 transition-colors">
                <input type="checkbox" checked={!!checkedItems[idx]} onChange={() => setCheckedItems(prev => ({...prev, [idx]: !prev[idx]}))} className="w-12 h-12 rounded-xl border-4 border-blue-200 text-blue-600 focus:ring-blue-500" />
                <span className={`text-3xl font-bold transition-all ${checkedItems[idx] ? 'text-slate-300 line-through' : 'text-slate-700'}`}>{item}</span>
              </label>
            ))}
          </div>
        </section>
      )}

      <style dangerouslySetInnerHTML={{ __html: `@media print { .no-print { display: none !important; } .opacity-0 { opacity: 1 !important; transform: none !important; pointer-events: auto !important; display: flex !important; } .hidden { display: block !important; } svg { max-width: 100%; height: auto; display: block; margin-left: auto; margin-right: auto; } }` }} />
    </div>
  );
};

export default HandoutViewer;