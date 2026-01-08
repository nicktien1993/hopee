
import { GoogleGenAI, Type } from "@google/genai";
import { SelectionParams, Chapter, HandoutContent, HomeworkConfig, HomeworkContent } from '../types';

const SYSTEM_INSTRUCTION = `你是一位專業國小資源班老師，擅長將複雜數學概念視覺化且口語化。
請嚴格遵守 JSON 格式輸出。

重要規範：
1. 針對資源班學生：文字極簡、步驟拆解、絕對不要擁擠。每行文字不宜過長，多用換行。
2. 數學圖形 (visualAidSvg)：
   - 請直接生成 <svg> 標籤。
   - 必須使用 viewBox 確保圖形完整，寬度設為 100%，高度建議 150-250。
   - 元素之間必須預留充足空白 (Spacing)，不可重疊。
   - 使用粗線條 (stroke-width: 3-5)。
   - 文字標籤 (<text>) 字體大小至少 18px，且不可與線條重疊。
3. 除法概念特別強化：
   - 當涉及除法時，請使用以下口語化定義：
     - 被除數：總共多少 (Total)
     - 除數：每份多少 / 分成幾份 (Size of each group)
     - 商：分給幾個人 / 得到的份數 (Number of groups)
4. 內容需符合指定難易度：
   - 易：數字 20 以內，無進退位。
   - 中：數字 100 以內，簡單進退位。
   - 難：數字 1000 以內或多步驟運算。`;

export const fetchChapters = async (params: SelectionParams): Promise<Chapter[]> => {
  // 每次執行都新建實體，確保金鑰最新
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `請檢索 ${params.year}學年度 ${params.publisher}版 ${params.grade}${params.semester} 數學課本目錄。請輸出 JSON 陣列。`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      thinkingConfig: { thinkingBudget: 0 },
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
  } catch (e) {
    console.error("Parse Error:", e);
    return [];
  }
};

export const generateHandoutFromText = async (params: SelectionParams, chapter: string, subChapter: string): Promise<HandoutContent> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `單元：${chapter}-${subChapter}。難易度：${params.difficulty}。
    請製作：核心概念、2題例題（含輔助圖形）、2題練習。
    如果是除法，請務必標註：被除數(總共多少)、除數(每份多少)、商(分給幾個人)。
    SVG 繪圖請確保「圖、文字、線條」之間有明顯間距，不要擠在一起。`,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      thinkingConfig: { thinkingBudget: 0 },
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          concept: { type: Type.STRING },
          visualAidSvg: { type: Type.STRING, description: "概念說明的 SVG 代碼" },
          examples: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                stepByStep: { type: Type.ARRAY, items: { type: Type.STRING } },
                answer: { type: Type.STRING },
                visualAidSvg: { type: Type.STRING, description: "例題的 SVG 代碼" }
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

export const generateHomework = async (params: SelectionParams, chapter: string, subChapter: string, config: HomeworkConfig): Promise<HomeworkContent> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `單元：${chapter}-${subChapter}。難易度：${config.difficulty}。產出計算題${config.calculationCount}題、應用題${config.wordProblemCount}題。
    確保文字敘述簡潔，每題之間有足夠空間。圖形需精確且不擁擠。`,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      thinkingConfig: { thinkingBudget: 0 },
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
