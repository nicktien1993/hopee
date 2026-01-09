import { GoogleGenAI, Type } from "@google/genai";
import { SelectionParams, Chapter, HandoutContent, HomeworkConfig, HomeworkContent } from '../types';

const SPECIAL_ED_INSTRUCTION = `你是一位資深的國小特教老師（資源班）。
你的學生在理解抽象數學符號上有困難，因此你的任務是製作「極度具象化」的教材。

【教材製作核心規範】：
1. 視覺排版：字體極大，句子極短（一行不超過12個字）。
2. 術語轉譯：
   - 禁止僅使用「被除數」、「除數」、「商」。
   - 必須標註口語：『(全部有多少)』、『(一份拿走幾個)』、『(可以分給幾個人)』。
   - 例：15 (全部有多少) ÷ 5 (一份拿走5個) = 3 (分給3個人)。
3. SVG 繪圖要求 (必填 visualAidSvg)：
   - 使用粗線條 (stroke-width: 5) 與鮮艷的高對比顏色。
   - 必須畫出對應數量的圓圈、錢幣、或方塊。
   - 如果是加減法，請畫出合併或拿走的箭頭圖示。
4. 解題腳步：提供 scaffold 拆解步驟。`;

export const fetchChapters = async (params: SelectionParams): Promise<Chapter[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `請搜尋並列出 ${params.year}學年度 ${params.publisher}版 國小數學 ${params.grade}${params.semester} 的課程單元目錄。`,
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
    const text = response.text || "[]";
    return JSON.parse(text);
  } catch {
    return [];
  }
};

export const generateHandoutFromText = async (params: SelectionParams, chapter: string, subChapter: string): Promise<HandoutContent> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `為資源班學生製作「${chapter} - ${subChapter}」的講義。難度：${params.difficulty}。請包含白話概念、1張核心SVG圖、2個拆解步驟例題與2題練習。`,
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
    model: 'gemini-3-flash-preview',
    contents: `製作「${chapter}-${subChapter}」的練習卷。計算題${config.calculationCount}題，應用題${config.wordProblemCount}題。`,
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