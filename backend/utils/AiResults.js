import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

export async function generateResult(prompt, model = "gemini-2.5-flash") {
  try {
    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      systemInstruction: `
You are a senior software developer with 15+ years of experience.
Always return code in fenced blocks (with language), optionally prefixed by [filename: name].
Example:
[filename: main.py]
\`\`\`python
print("Hello World")
\`\`\`
Then provide explanation separately.
      `,
    });

    const rawText = response.text || "";
    console.log("🔹 Raw AI output:", rawText);

    const filenameRegex = /\[filename:\s*([^\]]+)\]/g;
    const codeBlockRegex = /```([a-zA-Z0-9]*)\n([\s\S]*?)```/g;

    let files = [];
    let text = rawText;

    let filenames = [];
    let match;
    while ((match = filenameRegex.exec(rawText)) !== null) {
      filenames.push(match[1]);
    }

    let fileIndex = 0;
    let codeMatch;
    while ((codeMatch = codeBlockRegex.exec(rawText)) !== null) {
      const lang = codeMatch[1] || "text";
      const code = codeMatch[2];
      const filename = filenames[fileIndex] || `snippet${fileIndex + 1}.${lang}`;

      files.push({ filename, code });
      fileIndex++;
    }

    text = rawText
      .replace(filenameRegex, "")
      .replace(codeBlockRegex, "")
      .trim();

    return { text: text || "No explanation provided.", files };
  } catch (err) {
    console.error("Error generating AI response:", err);
    return { text: "AI error occurred.", files: [] };
  }
}
