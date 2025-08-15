

import { GoogleGenAI } from '@google/genai';
import type { Character } from '../types';
import { translations } from '../locales/translations';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzeSquads(squad1: Character[], squad2: Character[], language: string, errorString: string): Promise<string> {
  const squad1Details = squad1.map(c => `${c.name} (GP: ${c.galacticPower.toLocaleString()}, Speed: ${c.speed})`).join(', ');
  const squad2Details = squad2.map(c => `${c.name} (GP: ${c.galacticPower.toLocaleString()}, Speed: ${c.speed})`).join(', ');

  const languageName = {
      pl: 'Polish',
      en: 'English'
  }[language] || 'English';
  
  const headers = translations[language] || translations.en;

  const prompt = `
    You are an expert analyst for the mobile game Star Wars: Galaxy of Heroes (SWGoH).
    Your task is to provide a detailed comparison between two squads.
    The entire response MUST be in ${languageName}.
    The provided Galactic Power (GP) for each character is for Relic 8.
    **The provided Speed is the base speed at Relic 8 and is crucial for determining turn order. The first character to act is usually the one with the highest speed.**

    **CRITICAL INSTRUCTION: When mentioning a weakness, a counter, a significant disadvantage, or a "contraindication" for a character, you MUST bold the relevant text using markdown's double asterisks (e.g., **this is a weakness**). This is for highlighting key tactical points.**

    Squad A: ${squad1Details}
    Squad B: ${squad2Details}

    Provide your analysis using the following markdown headings:
    ## ${headers.analysisSquadA}
    ## ${headers.analysisSquadB}
    ## ${headers.analysisMatchup}
    ## ${headers.analysisOutcome}

    Under each heading, provide the analysis.
    - For squad analyses, describe their strengths, weaknesses, and key synergies.
    - For the Head-to-Head, point out key character matchups.
    - For the Predicted Outcome, state which squad is more likely to win and provide a concise reason why.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return errorString;
  }
}