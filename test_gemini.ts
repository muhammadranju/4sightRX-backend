import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
dotenv.config();

async function run() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  
  try {
    const models = ['gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-1.0-pro', 'gemini-1.0-pro-vision-latest'];
    for (const m of models) {
      try {
        console.log(`Trying ${m}...`);
        const model = genAI.getGenerativeModel({ model: m });
        await model.generateContent("Hello!");
        console.log(`[SUCCESS] ${m} works!`);
      } catch (e: any) {
        console.log(`[FAIL] ${m}: ${e.message}`);
      }
    }
  } catch (err: any) {
    console.error(err);
  }
}
run();
