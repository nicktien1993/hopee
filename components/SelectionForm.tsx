import React, { useState } from 'react';
import { SelectionParams, Publisher, Grade, Semester, Difficulty } from '../types.ts';

interface Props {
  initialParams: SelectionParams;
  onSubmit: (params: SelectionParams) => void;
  isLoading: boolean;
}

const publishers: Publisher[] = ['康軒', '南一', '翰林'];
const grades: Grade[] = ['一年級', '二年級', '三年級', '四年級', '五年級', '六年級'];
const semesters: Semester[] = ['上', '下'];
const difficulties: Difficulty[] = ['易', '中', '難'];

const SelectionForm: React.FC<Props> = ({ initialParams, onSubmit, isLoading }) => {
  const [form, setForm] = useState<SelectionParams>(initialParams);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">第一步：定位教材</h2>
        
        <div>
          <label className="block text-xs font-black text-slate-500 mb-2">學年度</label>
          <input 
            type="text" 
            value={form.year}
            onChange={e => setForm({...form, year: e.target.value})}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-black text-slate-500 mb-2">出版社</label>
          <div className="grid grid-cols-3 gap-2">
            {publishers.map(p => (
              <button
                key={p}
                onClick={() => setForm({...form, publisher: p})}
                className={`py-2 rounded-xl text-xs font-bold transition-all border-2 ${form.publisher === p ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-100 text-slate-400 hover:border-blue-200'}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-black text-slate-500 mb-2">年級</label>
            <select 
              value={form.grade}
              onChange={e => setForm({...form, grade: e.target.value as Grade})}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-3 text-sm font-bold focus:outline-none"
            >
              {grades.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-black text-slate-500 mb-2">學期</label>
            <select 
              value={form.semester}
              onChange={e => setForm({...form, semester: e.target.value as Semester})}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-3 text-sm font-bold focus:outline-none"
            >
              {semesters.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 space-y-4">
        <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">第二步：魔法強度</h2>
        <div>
          <div className="flex gap-2">
            {difficulties.map(d => (
              <button
                key={d}
                onClick={() => setForm({...form, difficulty: d})}
                className={`flex-1 py-2 rounded-xl text-xs font-black transition-all border-2 ${form.difficulty === d ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-100 text-slate-400'}`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button 
        onClick={() => onSubmit(form)}
        disabled={isLoading}
        className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-200 active:scale-95"
      >
        {isLoading ? '🧙‍♂️ 召喚中...' : '📚 載入全冊目錄'}
      </button>
    </div>
  );
};

export default SelectionForm;