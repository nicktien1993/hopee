import { GoogleGenAI, Type } from "@google/genai";
import { SelectionParams, Chapter, HandoutContent, HomeworkConfig, HomeworkContent } from '../types.ts';

const SPECIAL_ED_INSTRUCTION = `你是一位資深的國小特教老師。
你的學生在理解抽象符號上有困難，因此你的任務是製作「極度具象化」的教材。
【規範】：字體大、句子短、大量使用口語說明、SVG 繪圖需清晰。`;

// 使用兼容性最佳的模型
const DEFAULT_MODEL = 'gemini-3-flash-preview';

export const fetchChapters = async (params: SelectionParams): Promise<Chapter[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `請搜尋並列出 ${params.year}學年度 ${params.publisher}版 國小數學 ${params.grade}${params.semester} 的「完整單元目錄」。
  請包含章節名稱與其下的所有小單元名稱。請確保資訊來自最新網路資料。
  格式要求：JSON 陣列。`;

  const response = await ai.models.generateContent({
    model: DEFAULT_MODEL,
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            subChapters: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["id", "title", "subChapters"]
        }
      }
    }
  });
  
  try {
    const chapters: Chapter[] = JSON.parse(response.text || "[]");
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const urls = chunks.map((c: any) => c.web?.uri).filter(Boolean);
    return chapters.map(c => ({ ...c, sourceUrls: urls }));
  } catch {
    return [];
  }
};

export const generateHandoutFromText = async (params: SelectionParams, chapter: string, subChapter: string): Promise<HandoutContent> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: DEFAULT_MODEL,
    contents: `製作特教講義：${params.publisher}版 ${params.grade} ${chapter} - ${subChapter}。`,
    config: {
      systemInstruction: SPECIAL_ED_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          concept: { type: Type.STRING },
          visualAidSvg: { type: Type.STRING },
          examples: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                stepByStep: { type: Type.ARRAY, items: { type: Type.STRING } },
                answer: { type: Type.STRING },
                visualAidSvg: { type: Type.STRING }
              }
            }
          },
          exercises: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                answer: { type: Type.STRING }
              }
            }
          },
          tips: { type: Type.STRING },
          checklist: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    }
  });
  return JSON.parse(response.text || "{}");
};

export const generateHomework = async (params: SelectionParams, chapter: string, subChapter: string, config: HomeworkConfig): Promise<HomeworkContent> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: DEFAULT_MODEL,
    contents: `製作隨堂練習卷：${chapter} - ${subChapter}。題數：計算 ${config.calculationCount}, 應用 ${config.wordProblemCount}。`,
    config: {
      systemInstruction: SPECIAL_ED_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING },
                content: { type: Type.STRING },
                hint: { type: Type.STRING },
                answer: { type: Type.STRING },
                visualAidSvg: { type: Type.STRING }
              }
            }
          },
          checklist: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    }
  });
  return JSON.parse(response.text || "{}");
};