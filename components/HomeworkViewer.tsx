import React, { useRef, useState } from 'react';
import { HomeworkContent, SelectionParams, SpecialEdSettings } from '../types.ts';
import DrawingCanvas from './DrawingCanvas.tsx';

interface Props {
  content: HomeworkContent;
  params: SelectionParams;
}

const HomeworkViewer: React.FC<Props> = ({ content, params }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [visibleAnswers, setVisibleAnswers] = useState<Record<number, boolean>>({});
  const [visibleCanvas, setVisibleCanvas] = useState<Record<number, boolean>>({});
  const [settings] = useState<SpecialEdSettings>({
    showGrids: false,
    colorCoding: true,
    showArrows: false,
    showChecklist: true
  });
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});

  const questions = content.questions || [];
  const checklist = content.checklist || [];

  const highlightSymbols = (text: string) => {
    if (!text) return "";
    if (!settings.colorCoding) return text;
    return text.replace(/(\+|\-|\×|\÷|\=)/g, '<span class="text-orange-600 font-black px-1">$1</span>');
  };

  const toggleHelp = (i: number) => {
    setVisibleAnswers(prev => ({ ...prev, [i]: !prev[i] }));
  };

  const toggleCanvas = (i: number) => {
    setVisibleCanvas(prev => ({ ...prev, [i]: !prev[i] }));
  };

  return (
    <div className="bg-white p-10 rounded-xl shadow-sm border border-slate-200 min-h-[600px] relative">
      <div className="no-print mb-8 bg-orange-50 p-6 rounded-2xl border border-orange-100 flex items-center justify-between">
        <h3 className="font-black text-orange-900 flex items-center text-lg">🎯 隨堂練習功能</h3>
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="bg-slate-900 text-white px-5 py-2 rounded-full text-sm font-bold shadow-lg hover:bg-slate-800 transition">🖨️ 列印練習卷</button>
        </div>
      </div>

      <div ref={contentRef}>
        <div className="border-b-4 border-slate-800 pb-8 mb-12 text-center">
          <h1 className="text-4xl font-black text-slate-900 mb-4">🎯 隨堂練習：{content.title}</h1>
          <p className="text-xl text-slate-500 font-bold mb-6">{params.year}學年度 {params.publisher} {params.grade} {params.semester}學期</p>
          <div className="flex justify-center gap-16 text-2xl font-bold border-t-2 pt-8 border-slate-100">
            <span>姓名：_______________</span>
            <span>得分：_______________</span>
          </div>
        </div>

        <div className="space-y-24 pl-2">
          {questions.map((q, i) => (
            <div key={i} className="relative pb-12 border-b-2 border-slate-100 last:border-0">
              <div className="flex items-start gap-8">
                <span className="bg-orange-500 text-white font-black rounded-2xl w-14 h-14 flex items-center justify-center shrink-0 text-2xl shadow-lg">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-6">
                    <p className="text-3xl font-bold text-slate-800 leading-relaxed flex-1 mr-4" dangerouslySetInnerHTML={{ __html: highlightSymbols(q.content) }} />
                    <button 
                      onClick={() => toggleCanvas(i)}
                      className="no-print shrink-0 bg-white border-2 border-orange-200 text-orange-600 px-4 py-2 rounded-2xl text-sm font-black shadow-sm hover:bg-orange-50 transition-colors"
                    >
                      {visibleCanvas[i] ? '➖ 收合計算' : '✏️ 開啟計算'}
                    </button>
                  </div>

                  {q.visualAidSvg && (
                    <div className="mb-8 p-6 bg-slate-50 rounded-3xl flex justify-center">
                      <div className="w-full max-w-sm" dangerouslySetInnerHTML={{ __html: q.visualAidSvg }} />
                    </div>
                  )}
                  
                  {q.hint && (
                    <div className={`transition-all duration-500 overflow-hidden ${visibleAnswers[i] ? 'max-h-40 opacity-100 mb-8' : 'max-h-0 opacity-0 mb-0'}`}>
                      <p className="text-xl text-blue-600 font-bold bg-blue-50 p-4 rounded-2xl border-l-4 border-blue-400">
                        💡 提示：{q.hint}
                      </p>
                    </div>
                  )}
                  
                  <div className={`mt-6 mb-2 print:hidden ${visibleCanvas[i] ? 'block' : 'hidden'}`}>
                    <DrawingCanvas id={`hw-canvas-${i}`} height={600} isVisible={visibleCanvas[i]} />
                  </div>
                  
                  <div className="hidden print:block w-full h-96 border-4 border-dashed border-slate-100 rounded-[40px] bg-slate-50/10 mt-6"></div>
                </div>
              </div>
              <div className="text-right mt-8 flex justify-end items-center gap-6">
                <span className="text-3xl font-black text-slate-300 italic">答：</span>
                <div className={`min-w-[150px] text-right transition-all duration-300 ${visibleAnswers[i] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
                  <span className="text-4xl font-black text-orange-600 underline underline-offset-8 decoration-4">{q.answer}</span>
                </div>
                <button onClick={() => toggleHelp(i)} className={`no-print p-4 rounded-full border-2 transition-all shadow-md ml-6 active:scale-90 ${visibleAnswers[i] ? 'bg-amber-500 border-amber-600 text-white' : 'bg-white border-orange-100 text-amber-500 hover:bg-amber-50'}`}>
                  💡
                </button>
              </div>
            </div>
          ))}
        </div>

        {settings.showChecklist && (
          <section className="mt-20 p-8 bg-slate-50 rounded-[3rem] border-2 border-orange-200 border-dashed">
            <h3 className="text-2xl font-black text-orange-800 mb-6 flex items-center">🚀 檢查一下：</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {checklist.map((item, idx) => (
                <label key={idx} className="flex items-center gap-4 bg-white p-4 rounded-xl border border-orange-100 cursor-pointer group">
                  <input type="checkbox" checked={!!checkedItems[idx]} onChange={() => setCheckedItems(prev => ({...prev, [idx]: !prev[idx]}))} className="w-8 h-8 rounded-full border-2 border-orange-400 text-orange-600" />
                  <span className={`text-2xl font-bold transition-all ${checkedItems[idx] ? 'text-slate-300 line-through' : 'text-slate-700'}`}>{item}</span>
                </label>
              ))}
            </div>
          </section>
        )}
      </div>
      <style dangerouslySetInnerHTML={{ __html: `@media print { .no-print { display: none !important; } .opacity-0 { opacity: 1 !important; transform: none !important; pointer-events: auto !important; display: flex !important; } .max-h-0 { max-h: none !important; opacity: 1 !important; } svg { max-width: 100%; height: auto; } }` }} />
    </div>
  );
};

export default HomeworkViewer;