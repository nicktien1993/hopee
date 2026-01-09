
import React from 'react';
import { Chapter } from '../types';

interface Props {
  chapters: Chapter[];
  onSelect: (chapterTitle: string, subChapter: string) => void;
  isLoading: boolean;
}

const ChapterSelector: React.FC<Props> = ({ chapters, onSelect, isLoading }) => {
  // 提取所有章節中的不重複來源網址以便展示
  const allUrls = Array.from(new Set(chapters.flatMap(c => c.sourceUrls || [])));

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center">
        <span className="mr-3 text-2xl">📂</span> 2. 選擇單元
      </h2>
      <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
        {chapters.length === 0 ? (
          <p className="text-slate-400 font-bold text-center py-10">尚未載入目錄...</p>
        ) : (
          chapters.map(chapter => (
            <div key={chapter.id} className="border-l-4 border-blue-500 pl-4 py-1">
              <h3 className="font-black text-blue-900 text-lg mb-3">{chapter.title}</h3>
              <ul className="space-y-2">
                {chapter.subChapters.map((sub, idx) => (
                  <li key={idx}>
                    <button 
                      onClick={() => onSelect(chapter.title, sub)}
                      disabled={isLoading}
                      className="w-full text-left text-base font-bold text-slate-600 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-xl transition-all disabled:opacity-50 border border-transparent hover:border-blue-100"
                    >
                      • {sub}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>

      {/* 根據規範：展示 Search Grounding 的來源連結 */}
      {allUrls.length > 0 && (
        <div className="mt-6 pt-4 border-t border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">資料來源：</p>
          <ul className="space-y-1">
            {allUrls.map((url, i) => (
              <li key={i} className="truncate">
                <a 
                  href={url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-[10px] text-blue-400 hover:underline flex items-center gap-1"
                >
                  <span className="shrink-0">🔗</span>
                  <span className="truncate">{url}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ChapterSelector;
