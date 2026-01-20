import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini with the API Key
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const STANDARD_SCHEMA = [
  "student_name",
  "father_name",
  "roll_number",
  "dob",
  "contact_number",
  "address"
];

/**
 * Uses Gemini Flash to map arbitrary CSV headers to our Sovereign Schema.
 * @param csvHeaders - Array of headers from the uploaded file (e.g., ["Pita Ji", "Bachha Name"])
 * @returns JSON mapping
 */
export async function mapColumnsWithAI(csvHeaders: string[]) {
  const model = "gemini-2.5-flash-preview";

  const prompt = `
    You are a Data Import Assistant for an Indian School ERP.
    Map the following "messy" CSV headers to the standard database schema fields.
    
    Standard Schema: ${JSON.stringify(STANDARD_SCHEMA)}
    Input Headers: ${JSON.stringify(csvHeaders)}
    
    Rules:
    1. Map 'Pita', 'Father', 'Dad' to 'father_name'.
    2. Map 'Name', 'Student', 'Bachha' to 'student_name'.
    3. Return null for columns that don't match or are irrelevant.
  `;

  const response = await ai.models.generateContent({
    model: model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          mapping: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                csvHeader: { type: Type.STRING },
                standardField: { type: Type.STRING, nullable: true },
                confidence: { type: Type.NUMBER }
              },
              required: ["csvHeader", "standardField", "confidence"]
            }
          }
        }
      }
    }
  });

  // Safe extraction of the text response
  const result = response.text;
  if (!result) {
    throw new Error("Failed to generate AI mapping");
  }

  return JSON.parse(result);
}
