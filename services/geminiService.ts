import { GoogleGenAI, Type } from "@google/genai";
import { SelectionParams, Chapter, HandoutContent, HomeworkConfig, HomeworkContent } from '../types';

const SYSTEM_INSTRUCTION = `你是一位資深的國小特教老師，專門教授數學資源班。
你的任務是根據學生的學年度、出版社、年級與單元，生成量身定制的數學講義或練習卷。

【特教教學規範】：
1. 視覺設計：內容必須極度簡潔，每頁資訊量不宜過多。使用大量換行，句子簡短。
2. 除法教學專屬語法（重要）：
   - 在所有題目與解釋中，將「被除數」稱呼為「(總共多少)」。
   - 將「除數」稱呼為「(每份多少)」或「(分成幾份)」。
   - 將「商」稱呼為「(分完後的答案)」。
   - 範例：12 (總共多少) ÷ 3 (每份多少) = 4 (分給4個人)。
3. SVG 繪圖準則：
   - 必須提供精確的 <svg>。
   - 使用粗線條 (stroke-width: 4-6) 和明亮的對比色。
   - 確保所有文字標籤 (<text>) 與線條之間有足夠的空白間距。
   - 寬度一律設定為 100%，高度在 200px 左右。
4. 難度動態調整：
   - 易：僅限個位數或 20 以內，無進位。
   - 中：100 以內，簡單步驟。
   - 難：多位數或二步應用題。`;

export const fetchChapters = async (params: SelectionParams): Promise<Chapter[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `請檢索 ${params.year}學年度 ${params.publisher}版 數學 ${params.grade}${params.semester} 的課本目錄。請以 JSON 陣列格式輸出。`,
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
    return JSON.parse(response.text || "[]");
  } catch (e) {
    return [];
  }
};

export const generateHandoutFromText = async (params: SelectionParams, chapter: string, subChapter: string): Promise<HandoutContent> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `請針對單元「${chapter} - ${subChapter}」製作特教版數學講義。難度：${params.difficulty}。
    內容需含：核心觀念說明（附口語化口訣）、1張視覺輔助圖、2題拆解步驟的例題、2題練習。
    如果是除法，一定要標註：總共多少、每份多少。`,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
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
        },
        required: ["title", "concept", "examples", "exercises", "tips", "checklist"]
      }
    }
  });
  return JSON.parse(response.text || "{}");
};

export const generateHomework = async (params: SelectionParams, chapter: string, subChapter: string, config: HomeworkConfig): Promise<HomeworkContent> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `製作隨堂練習卷。單元：${chapter}-${subChapter}。
    數量：計算題${config.calculationCount}題、應用題${config.wordProblemCount}題。
    難度：${config.difficulty}。請確保題目間距加大。`,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
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
        },
        required: ["title", "questions", "checklist"]
      }
    }
  });
  return JSON.parse(response.text || "{}");
};