
import React, { useState } from 'react';
import { HomeworkConfig, Difficulty } from '../types';

interface Props {
  onGenerate: (config: HomeworkConfig) => void;
  isLoading: boolean;
}

const HomeworkConfigSection: React.FC<Props> = ({ onGenerate, isLoading }) => {
  const [config, setConfig] = useState<HomeworkConfig>({
    calculationCount: 3,
    wordProblemCount: 2,
    difficulty: '易'
  });

  const difficulties: Difficulty[] = ['易', '中', '難'];

  return (
    <div className="bg-gradient-to-br from-rose-50 to-orange-50 p-8 rounded-3xl border-4 border-rose-100 shadow-lg mt-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex-1">
          <h2 className="text-2xl font-black text-rose-900 mb-2 flex items-center">
            <span className="mr-3 text-3xl">🚀</span> 講義讀完了？來產出練習卷吧！
          </h2>
          <p className="text-rose-700/70 font-bold">根據孩子今天的學習狀況，調整作業題數與難度：</p>
        </div>
        <div className="w-full md:w-auto flex flex-col gap-4 min-w-[300px]">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/80 p-3 rounded-2xl border border-rose-100">
              <label className="block text-[10px] font-black text-rose-400 mb-1 uppercase tracking-wider">計算題數</label>
              <input 
                type="number" 
                min="0" max="10"
                value={config.calculationCount}
                onChange={e => setConfig({...config, calculationCount: parseInt(e.target.value) || 0})}
                className="w-full bg-transparent border-none text-2xl font-black text-rose-900 focus:ring-0 p-0"
              />
            </div>
            <div className="bg-white/80 p-3 rounded-2xl border border-rose-100">
              <label className="block text-[10px] font-black text-rose-400 mb-1 uppercase tracking-wider">應用題數</label>
              <input 
                type="number" 
                min="0" max="10"
                value={config.wordProblemCount}
                onChange={e => setConfig({...config, wordProblemCount: parseInt(e.target.value) || 0})}
                className="w-full bg-transparent border-none text-2xl font-black text-rose-900 focus:ring-0 p-0"
              />
            </div>
          </div>
          
          <div className="bg-white/80 p-3 rounded-2xl border border-rose-100">
            <label className="block text-[10px] font-black text-rose-400 mb-1 uppercase tracking-wider">難易度</label>
            <div className="flex gap-1 mt-1">
              {difficulties.map(d => (
                <button
                  key={d}
                  onClick={() => setConfig({...config, difficulty: d})}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all ${config.difficulty === d ? 'bg-rose-600 text-white shadow-sm' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={() => onGenerate(config)}
            disabled={isLoading}
            className="w-full py-5 bg-rose-600 text-white text-xl font-black rounded-2xl hover:bg-rose-700 transition-all shadow-xl hover:shadow-rose-200 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {isLoading ? '正在生成練習卷...' : '✨ 生成隨堂練習'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomeworkConfigSection;