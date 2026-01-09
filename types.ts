
export type Publisher = '康軒' | '南一' | '翰林';
export type Semester = '上' | '下';
export type Grade = '一年級' | '二年級' | '三年級' | '四年級' | '五年級' | '六年級';
export type Difficulty = '易' | '中' | '難';

export interface SelectionParams {
  year: string;
  publisher: Publisher;
  semester: Semester;
  grade: Grade;
  difficulty: Difficulty;
}

export interface Chapter {
  id: string;
  title: string;
  subChapters: string[];
  sourceUrls?: string[]; // 新增：用於儲存 Search Grounding 的來源連結
}

export interface HandoutContent {
  title: string;
  concept: string;
  visualAidSvg?: string; // 新增：精確的數學 SVG 程式碼
  examples: Array<{
    question: string;
    stepByStep: string[];
    answer: string;
    visualAidSvg?: string; // 每個例題也可以有專屬圖形
  }>;
  exercises: Array<{
    question: string;
    answer: string;
  }>;
  tips: string;
  checklist: string[]; 
}

export interface HomeworkConfig {
  calculationCount: number;
  wordProblemCount: number;
  difficulty: Difficulty;
}

export interface HomeworkContent {
  title: string;
  questions: Array<{
    type: '計算題' | '應用題';
    content: string;
    hint?: string;
    answer?: string;
    visualAidSvg?: string; // 題目也可以有輔助圖形
  }>;
  checklist: string[]; 
}

export interface SpecialEdSettings {
  showGrids: boolean;
  colorCoding: boolean;
  showArrows: boolean;
  showChecklist: boolean;
}
