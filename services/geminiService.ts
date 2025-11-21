
import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const parseCollabText = async (inputText: string, userEmail?: string): Promise<any[]> => {
  try {
    const modelId = "gemini-2.5-flash";
    
    const prompt = `
      你是一个专业的自媒体商务助理。请分析以下文本（可能是邮件源码、.eml文件内容、微信记录），提取商务合作邀约。

      上下文信息：
      ${userEmail ? `- 当前用户（博主）的邮箱是: ${userEmail} (请忽略以此邮箱为发件人的邮件，这通常是发件箱备份)` : ''}

      任务要求：
      1. 识别文本中是否包含合作邀约。如果是垃圾邮件、系统通知或用户自己发出的邮件，请跳过。
      2. 处理 .eml 格式时，优先从 'From:' 字段提取邮箱和品牌名，从 'Date:' 字段提取日期。
      3. 即使文本混乱，也要尽力提取。

      请提取以下字段：
      1. brandName: 品牌方名称。
         - 优先提取发件人昵称（如 "完美日记 <pr@...>" 中的 "完美日记"）。
         - 如果没有昵称，根据邮箱后缀或正文内容推断。
      2. email: 联系邮箱。
         - 提取 Reply-To 或 From 字段中的邮箱。
      3. requestDate: 邀约日期 (格式 YYYY-MM-DD)。
         - 解析邮件头中的 Date 字段（如 "Mon, 25 Dec 2023..."）。
         - 如果没有年份，默认 2024/2025。
      4. summary: 合作摘要 (15字以内)。
         - 例如："新品口红推广", "双11种草视频", "置换合作"。
      5. budget: 预算信息。
         - 提取如 "无费置换", "预算5k", "车马费" 等关键词。没有则留空。

      待分析内容：
      ${inputText.substring(0, 30000)} 
    `;
    // Limit input length to prevent token overflow, though flash context is large.

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              brandName: { type: Type.STRING },
              email: { type: Type.STRING },
              requestDate: { type: Type.STRING },
              summary: { type: Type.STRING },
              budget: { type: Type.STRING },
            },
            required: ["brandName", "summary"],
          },
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return [];
  } catch (error) {
    console.error("AI Parsing Error:", error);
    throw error;
  }
};
