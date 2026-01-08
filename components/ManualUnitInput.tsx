import React, { useState } from 'react';

interface Props {
  onGenerate: (chapter: string, sub: string) => void;
  isLoading: boolean;
}

const ManualUnitInput: React.FC<Props> = ({ onGenerate, isLoading }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    const parts = inputValue.split(/[之\-]/);
    const chapter = parts.length > 1 ? parts[0].trim() : '自訂單元';
    const sub = parts.length > 1 ? parts.slice(1).join('之').trim() : parts[0].trim();
    
    onGenerate(chapter, sub);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-t-4 border-t-amber-400">
      <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
        <span className="mr-2">✏️</span> 3. 或是手動輸入單元
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <input 
          type="text" 
          placeholder="例如：分數的加法"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="w-full border border-slate-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
          disabled={isLoading}
        />
        <button 
          type="submit"
          disabled={isLoading || !inputValue.trim()}
          className="w-full py-3 bg-slate-900 text-white font-black rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-all active:scale-95 shadow-md"
        >
          {isLoading ? '正在製作...' : '開始製作教材'}
        </button>
      </form>
      <p className="mt-3 text-xs text-slate-400 font-medium">※ 如果在目錄找不到您要的單元，請直接在這裡輸入名稱製作。</p>
    </div>
  );
};

export default ManualUnitInput;