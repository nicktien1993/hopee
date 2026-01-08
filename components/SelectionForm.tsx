
import React, { useState } from 'react';
import { SelectionParams, Publisher, Grade, Semester, Difficulty } from '../types';

interface Props {
  onSubmit: (params: SelectionParams) => void;
  isLoading: boolean;
}

const publishers: Publisher[] = ['康軒', '南一', '翰林'];
const grades: Grade[] = ['一年級', '二年級', '三年級', '四年級', '五年級', '六年級'];
const semesters: Semester[] = ['上', '下'];
const difficulties: Difficulty[] = ['易', '中', '難'];

const SelectionForm: React.FC<Props> = ({ onSubmit, isLoading }) => {
  const [form, setForm] = useState<SelectionParams>({
    year: '114',
    publisher: '康軒',
    grade: '一年級',
    semester: '上',
    difficulty: '易'
  });

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
        <span className="mr-2">📚</span> 1. 教材基礎設定
      </h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">學年度</label>
          <input 
            type="text" 
            value={form.year}
            onChange={e => setForm({...form, year: e.target.value})}
            className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">出版社</label>
          <select 
            value={form.publisher}
            onChange={e => setForm({...form, publisher: e.target.value as Publisher})}
            className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            {publishers.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">年級</label>
            <select 
              value={form.grade}
              onChange={e => setForm({...form, grade: e.target.value as Grade})}
              className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {grades.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">學期</label>
            <select 
              value={form.semester}
              onChange={e => setForm({...form, semester: e.target.value as Semester})}
              className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {semesters.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">難易度 (講義例題)</label>
          <div className="flex gap-2">
            {difficulties.map(d => (
              <button
                key={d}
                type="button"
                onClick={() => setForm({...form, difficulty: d})}
                className={`flex-1 py-2 rounded-md font-bold text-sm transition-all border-2 ${form.difficulty === d ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
              >
                {d === '易' ? '🟢 ' : d === '中' ? '🟡 ' : '🔴 '}{d}
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={() => onSubmit(form)}
          disabled={isLoading}
          className="w-full py-3 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 disabled:opacity-50 transition shadow-sm mt-2"
        >
          {isLoading ? '處理中...' : '確認設定並查詢目錄'}
        </button>
      </div>
    </div>
  );
};

export default SelectionForm;