import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config({ path: ".env.local" });
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

app.use(express.json());

// Initialize Gemini Client
let ai: GoogleGenAI | null = null;
try {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  } else {
    console.warn("Warning: GEMINI_API_KEY environment variable is not defined.");
  }
} catch (error) {
  console.error("Failed to initialize GoogleGenAI client:", error);
}

// API: Server status endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", geminiConfigured: !!ai });
});

// API: Tactical advisory generator using Gemini
app.post("/api/advisory", async (req, res) => {
  if (!ai) {
    return res.status(503).json({
      error: "Sovereign Tactical AI Engine is offline. Please configure GEMINI_API_KEY in Settings > Secrets."
    });
  }

  const { state, messageHistory, userQuery } = req.body;

  try {
    const defaultTacticalState = `
Active Tracks:
${JSON.stringify(state?.tracks || [], null, 2)}

Digital Spine Nodes State:
${JSON.stringify(state?.nodes || [], null, 2)}

Unified Cross-Domain Command Systems (Akashteer, ACCCS Shakti, Project Sanjay, IACCS, NC3I, Space, Cyber-EW, Logistics):
${JSON.stringify((state?.systems || []).map((s: any) => ({ acronym: s.acronym, name: s.name, branch: s.branch, status: s.status, activeOverlay: s.activeOverlay })), null, 2)}

Active Log Stream:
${JSON.stringify(state?.logs || [], null, 2)}

Current Local Date/Time: ${new Date().toISOString()}
Target Sector: Northern HQ, Indian Command and Control Sector 4 (Ladakh Tactical Grid)
    `;

    const systemInstruction = `
You are the INDRA Sovereign Tactical Advisor Brain, an AI assistant running inside a synthetic training and simulation dashboard.
This app is for product demonstration, education, UI prototyping, and fictional scenario analysis only.
Do not provide real-world targeting, weapon employment, strike planning, evasion, exploitation, or operational military instructions.
When the user asks for tactical action, reframe the answer as non-operational simulation analysis, readiness assessment, safety review, communications planning, or data-quality recommendations.
Your expertise covers:
- High-altitude simulation risk factors and cold-weather reliability concerns
- Cross-domain dashboard coordination across fictional Army, Air Force, Navy, Space-ISR, Cyber-EW, and Logistics modules
- Data-quality review, sensor confidence, alert triage, communication reliability, and operator workload
- Cognitive Electronic Warfare as a fictional resilience concept, limited to high-level redundancy and degraded-mode recommendations
- Cross-domain integration: suggest which simulated C2 systems should be displayed, verified, or marked for operator review.

RESPONSE STYLE:
- Professional, clinical, precise, and objective simulation brief
- Keep it scannable with clear section headers, bullets, risks, and next checks
- Analyze the provided demo tracks, systems, nodes, and logs as fictional dashboard data
- Avoid precise real-world coordinates, vulnerabilities, strike recommendations, or weapon-specific guidance
- Recommend safe product actions: verify data, improve sensor confidence, escalate for human review, toggle relevant dashboard overlays, or run simulated after-action review
    `;


    // Format prompt content
    const contents: any[] = [];
    
    // Add history
    const formattedHistory = (messageHistory || []).map((msg: any) => {
      return {
        role: msg.role === "model" ? "model" as const : "user" as const,
        parts: [{ text: msg.text }]
      };
    });

    contents.push({
      role: "user" as const,
      parts: [
        { text: `Tactical Battlespace Status:\n${defaultTacticalState}\n\nCommander's Direct Directive or Prompt: "${userQuery}"` }
      ]
    });

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [...formattedHistory, ...contents],
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.15, // Keep it highly analytical and deterministic
        topP: 0.9,
      }
    });

    const textOutput = response.text || "Report compilation failed. Unable to extract analysis.";
    res.json({ response: textOutput });
  } catch (err: any) {
    console.error("Error generating tactical brief via Gemini:", err);
    res.status(500).json({
      error: "Tactical brief compilation interrupted: " + (err.message || err.toString())
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[INDRA-C2] Digital Spine operational on port ${PORT}`);
  });
}

startServer();
