import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Ordered from highest quality to fastest
const MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash",
];

const RETRYABLE_STATUS = [429, 500, 502, 503, 504];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function callModel(model, prompt, retries = 3) {
  let delay = 1000;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Using model: ${model} (Attempt ${attempt})`);

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
      });

      return response.text;
    } catch (error) {
      const status =
        error?.status ||
        error?.code ||
        error?.response?.status ||
        error?.error?.code;

      console.log(
        `❌ ${model} failed (Attempt ${attempt}) | Status: ${status}`
      );

      if (
        !RETRYABLE_STATUS.includes(Number(status)) ||
        attempt === retries
      ) {
        throw error;
      }

      console.log(`Retrying ${model} in ${delay} ms...`);
      await sleep(delay);
      delay *= 2;
    }
  }
}

export const generateContent = async (prompt) => {
  let lastError;

  for (const model of MODELS) {
    try {
      return await callModel(model, prompt);
    } catch (error) {
      lastError = error;
      console.log(`Switching from ${model} to next fallback model...`);
    }
  }

  console.error("All Gemini models failed.");

  throw new Error(
    `All Gemini models are currently unavailable.\n\nLast Error: ${
      lastError?.message || "Unknown error"
    }`
  );
};

export { ai };