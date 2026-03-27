import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prepareInstructions } from "../constants";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    console.log("API HIT");

      const { base64Image, jobTitle, jobDescription } = req.body;
      console.log("Image size (chars):", base64Image.length);
    console.log("API HIT2");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    console.log("API HIT3");
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });
    console.log("API HIT4");
    // 🔥 STEP 1: Extract text from image
console.log("STEP 1: Extracting text...");

const ocrResult = await model.generateContent([
  "Extract all text from this resume. Return only plain text.",
  {
    inlineData: {
      mimeType: "image/jpeg",
      data: base64Image,
    },
  },
]);

const extractedText = ocrResult.response.text();

console.log("OCR DONE");

// 🔥 STEP 2: Analyze extracted text
console.log("STEP 2: Analyzing...");

const analysisPrompt =
  prepareInstructions({ jobTitle, jobDescription }) +
  `\n\nResume:\n${extractedText}`;

const analysisResult = await model.generateContent(analysisPrompt);

const finalText = analysisResult.response.text();

console.log("ANALYSIS DONE");
console.log("Final Analysis:", finalText);
return res.status(200).json({ result: finalText });
    
  } catch (error) {
    console.error("API ERROR:", error);
    return res.status(500).json({ error: "Failed" });
  }
}