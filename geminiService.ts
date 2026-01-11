
import { GoogleGenAI } from "@google/genai";
import { Team, Match } from "./types";

// Always use process.env.API_KEY directly as required by guidelines
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const getScoutingReport = async (teams: Team[], matches: Match[]): Promise<string> => {
  const context = `
    赛事数据:
    球队: ${JSON.stringify(teams.map(t => ({ 名称: t.name, 积分: t.stats.points, 进球: t.stats.gf, 失球: t.stats.ga })))}
    比赛结果: ${JSON.stringify(matches.filter(m => m.status === 'FINISHED').map(m => `${m.homeTeamId} ${m.homeScore}-${m.awayScore} ${m.awayTeamId}`))}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `你是一位资深的足球评论员和战术分析师。请根据提供的赛事数据，用中文撰写一份专业的分析报告，包含以下三个部分：
      1. 争冠形势分析（重点分析积分领先的球队）。
      2. 状态预警（分析表现不及预期的球队）。
      3. 未来赛事看点与预测。
      请保持语气专业、客观且富有洞察力。内容要求在300字左右。\n\n${context}`,
    });
    // Accessing .text property directly instead of .text() method
    return response.text || "暂时无法生成分析。";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "AI 球探目前正在休息，请稍后再试。";
  }
};
