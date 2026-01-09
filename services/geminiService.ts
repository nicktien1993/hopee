import { GoogleGenAI, Type } from "@google/genai";
import { SelectionParams, Chapter, HandoutContent, HomeworkConfig, HomeworkContent } from '../types';

const SPECIAL_ED_INSTRUCTION = `你是一位資深的國小特教老師（資源班）。
你的任務是製作適合學生的數學教材。

【教學規範】：
1. 視覺：文字加大，句子極簡，每行不超過15個字。
2. 專業術語轉化：
   - 絕不使用「被除數」、「除數」、「商」等艱澀詞彙。
   - 必須標註：『(總共多少)』、『(每份多少)』、『(分成幾份)』、『(剩下的)』。
   - 例如：15 (總共多少) ÷ 3 (每份多少) = 5 (分成5份)。
3. SVG 繪圖：
   - 使用粗線條 (stroke-width: 5) 和高對比顏色。
   - 背景必須為透明或純白，確保列印清晰。
4. 難度：
   - 易：20以內，無進位/退位。
   - 中：100以內。
   - 難：多位數或複合運算。`;

export const fetchChapters = async (params: SelectionParams): Promise<Chapter[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `請檢索 ${params.year}學年度 ${params.publisher}版 數學 ${params.grade}${params.semester} 的課本單元目錄。`,
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
    const data = JSON.parse(response.text || "[]");
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error("Parse chapters error:", e);
    return [];
  }
};

export const generateHandoutFromText = async (params: SelectionParams, chapter: string, subChapter: string): Promise<HandoutContent> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `製作單元「${chapter} - ${subChapter}」的資源班數學講義。難度：${params.difficulty}。需包含口語化概念、1張SVG輔助圖、2題分解步驟的例題、2題練習。`,
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
    contents: `製作「${chapter}-${subChapter}」的隨堂練習卷。題數：計算${config.calculationCount}、應用${config.wordProblemCount}。難度：${config.difficulty}。`,
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