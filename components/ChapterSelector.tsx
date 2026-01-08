import React from 'react';
import { Chapter } from '../types';

interface Props {
  chapters: Chapter[];
  onSelect: (chapterTitle: string, subChapter: string) => void;
  isLoading: boolean;
}

const ChapterSelector: React.FC<Props> = ({ chapters, onSelect, isLoading }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
        <span className="mr-2">📂</span> 2. 從目錄選擇單元
      </h2>
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {chapters.map(chapter => (
          <div key={chapter.id} className="border-l-4 border-blue-400 pl-3">
            <h3 className="font-bold text-slate-700 mb-2">{chapter.title}</h3>
            <ul className="space-y-1">
              {chapter.subChapters.map((sub, idx) => (
                <li key={idx}>
                  <button 
                    onClick={() => onSelect(chapter.title, sub)}
                    disabled={isLoading}
                    className="w-full text-left text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition disabled:opacity-50"
                  >
                    • {sub}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChapterSelector;