import { GoogleGenAI, Type } from "@google/genai";
import { SelectionParams, Chapter, HandoutContent, HomeworkConfig, HomeworkContent } from '../types';

// 特教教學法系統提示詞
const SPECIAL_ED_INSTRUCTION = `你是一位資深的國小特教老師（資源班）。
你的學生在理解抽象數學符號上有困難，因此你的任務是製作「極度具象化」的教材。

【教材製作核心規範】：
1. 視覺排版：字體極大，句子極短（一行不超過12個字）。
2. 術語轉譯：必須標註口語：『(全部有多少)』、『(一份拿走幾個)』、『(可以分給幾個人)』。
3. SVG 繪圖要求 (必填 visualAidSvg)：使用粗線條 (stroke-width: 5) 與鮮艷的高對比顏色。
4. 解題腳步：提供 scaffold 拆解步驟。`;

/**
 * 獲取單元目錄
 * 使用 Google Search 尋找課程大綱，並提取來源連結以符合規範
 */
export const fetchChapters = async (params: SelectionParams): Promise<Chapter[]> => {
  // 每次呼叫前建立新實例，確保使用最新選擇的金鑰
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview', // 搜尋功能必須使用此模型以獲得最佳支援
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
    const chapters: Chapter[] = JSON.parse(text);
    
    // 提取來源連結
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const urls = chunks
      .map((chunk: any) => chunk.web?.uri)
      .filter((uri: string | undefined): uri is string => !!uri);
    
    if (urls.length > 0) {
      return chapters.map(c => ({ ...c, sourceUrls: urls }));
    }
    return chapters;
  } catch {
    return [];
  }
};

/**
 * 根據單元生成特教講義
 */
export const generateHandoutFromText = async (params: SelectionParams, chapter: string, subChapter: string): Promise<HandoutContent> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `為資源班學生製作「${chapter} - ${subChapter}」的講義。難度：${params.difficulty}。`,
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
              },
              required: ["question", "stepByStep", "answer"]
            }
          },
          exercises: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                answer: { type: Type.STRING }
              },
              required: ["question", "answer"]
            }
          },
          tips: { type: Type.STRING },
          checklist: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["title", "concept", "examples", "exercises", "tips", "checklist"]
      }
    }
  });
  return JSON.parse(response.text || "{}");
};

/**
 * 產生練習卷內容
 */
export const generateHomework = async (
  params: SelectionParams, 
  chapter: string, 
  subChapter: string, 
  config: HomeworkConfig
): Promise<HomeworkContent> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `請為資源班學生製作「${chapter} - ${subChapter}」的練習卷。
    難易度：${config.difficulty}。
    題數配置：計算題 ${config.calculationCount} 題，應用題 ${config.wordProblemCount} 題。`,
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
                type: { type: Type.STRING, description: '必須為 "計算題" 或 "應用題"' },
                content: { type: Type.STRING },
                hint: { type: Type.STRING },
                answer: { type: Type.STRING },
                visualAidSvg: { type: Type.STRING }
              },
              required: ["type", "content", "answer"]
            }
          },
          checklist: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["title", "questions", "checklist"]
      }
    }
  });
  return JSON.parse(response.text || "{}");
};