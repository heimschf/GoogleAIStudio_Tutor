import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Initialize Google GenAI
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

app.use(express.json());

// API route for tutor chat
app.post("/api/tutor", async (req, res) => {
  try {
    if (!ai) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is not configured or is missing from the Secrets panel.",
      });
    }

    const { messages, currentTopic, sandboxCode, sandboxOutput } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Missing messages array in body." });
    }

    const systemInstruction = `You are "Professor Sigma", a warm, encouraging, and highly knowledgeable R Professor and Descriptive Statistics Tutor.

Your core mission is to help the student understand Descriptive Statistics concepts and learn to implement them in R.
You teach metrics of central tendency (mean, median, mode), metrics of dispersion (variance, standard deviation, range, IQR), summaries, percentiles, quantiles, and visual plots (histograms, boxplots).

GUIDELINES:
1. Always keep explanations clear, easy to read, and educational. Use real-world analogies (e.g. grading curves, height variations, shipping logs) to explain formulas.
2. Structure your replies with elegant Markdown spacing, list items, bold terminology, and clear R code blocks.
3. Be patient and guiding. Do not just spit out answers to quizzes or challenges; guide them with conceptual tips or step-by-step math breakdowns.
4. Integrate their workspace state to make your coaching hyper-relevant:
   - Current Section they are reading: ${currentTopic || "Introduction to Descriptive Statistics"}
   - Active R code in their compiler editor:\n\`\`\`R\n${sandboxCode || "# No code active currently"}\n\`\`\`
   - Latest simulated execution terminal output:\n${sandboxOutput || "(No outputs run yet)"}
5. Keep your tone professional, friendly, and helpful. Always encourage the student to experiment by running R code directly in their integrated sandbox.`;

    // Map messages payload to Gemini contents format
    const contents = messages.map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Error invoking Gemini API:", error);
    res.status(500).json({
      error: "Professor Sigma failed to respond: " + (error.message || "An error occurred."),
    });
  }
});

// Serve static assets based on environment wrapped in startServer
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server starting and listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();

export default app;
