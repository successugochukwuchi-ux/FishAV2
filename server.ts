import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Default hardcoded OpenRouter API Key from instructions
const DEFAULT_OPENROUTER_API_KEY = "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";

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: "50mb" }));

  // API Route: Text to Speech proxy for OpenRouter
  app.post("/api/tts", async (req, res) => {
    try {
      const {
        text,
        voice = "alex",
        model = "fish-audio/s2.1-pro-free:free",
        apiKey: userApiKey,
        response_format = "mp3"
      } = req.body;

      if (!text || typeof text !== "string" || text.trim().length === 0) {
        return res.status(400).json({ error: "Text is required for TTS generation." });
      }

      const apiKey = userApiKey || process.env.OPENROUTER_API_KEY || DEFAULT_OPENROUTER_API_KEY;

      const openrouterUrl = "https://openrouter.ai/api/v1/audio/speech";

      const headers: Record<string, string> = {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.APP_URL || "https://ais-dev.run.app",
        "X-Title": "Fish Audio Voiceover Studio"
      };

      let actualModel = model || "fish-audio/s2.1-pro-free:free";
      let actualVoice = voice;

      // If model looks like a 32-char voice model ID or does not contain a slash '/', map it to voice and reset model
      if (typeof actualModel === "string" && (!actualModel.includes("/") || actualModel.length === 32)) {
        if (!actualVoice || actualVoice === "alex" || actualVoice === "anna") {
          actualVoice = actualModel;
        }
        actualModel = "fish-audio/s2.1-pro-free:free";
      }

      const bodyObj: Record<string, any> = {
        model: actualModel,
        input: text,
        response_format: response_format || "mp3"
      };

      // Pass voice parameter if provided (e.g. Fish Audio model IDs like 'ca3007f96ae7499ab87d27ea3599956a', 'alloy', or custom model IDs)
      if (actualVoice && typeof actualVoice === "string" && actualVoice.trim().length > 0) {
        const cleanVoice = actualVoice.trim();
        // Omit generic internal fallback names ('alex', 'anna', 'benjamin', 'eva') if they aren't Fish Audio 32-char model IDs
        if (!["alex", "anna", "benjamin", "eva"].includes(cleanVoice)) {
          bodyObj.voice = cleanVoice;
        }
      }

      let response = await fetch(openrouterUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(bodyObj)
      });

      // If OpenRouter returned 400 and voice was present in bodyObj, retry without voice
      if (!response.ok && response.status === 400 && bodyObj.voice) {
        delete bodyObj.voice;
        response = await fetch(openrouterUrl, {
          method: "POST",
          headers,
          body: JSON.stringify(bodyObj)
        });
      }

      if (!response.ok) {
        const errText = await response.text();
        console.error("OpenRouter API error:", response.status, errText);
        return res.status(response.status).json({
          error: `OpenRouter returned status ${response.status}: ${errText}`
        });
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Check if response returned JSON string containing base64 audio
      // e.g. {"audio": "..."} or {"data": "..."}
      if (buffer.length > 0 && (buffer[0] === 123 || buffer[0] === 34)) {
        const textStr = buffer.toString("utf-8");
        try {
          const parsed = JSON.parse(textStr);
          if (parsed.audio) {
            const audioBuf = Buffer.from(parsed.audio, "base64");
            res.setHeader("Content-Type", "audio/mpeg");
            return res.send(audioBuf);
          } else if (parsed.data) {
            const audioBuf = Buffer.from(parsed.data, "base64");
            res.setHeader("Content-Type", "audio/mpeg");
            return res.send(audioBuf);
          } else if (parsed.error) {
            return res.status(500).json({ error: parsed.error });
          }
        } catch {
          // If JSON parse failed, check regex or raw base64 string
          const audioMatch = textStr.match(/"audio"\s*:\s*"([^"]+)"/);
          if (audioMatch) {
            const audioBuf = Buffer.from(audioMatch[1], "base64");
            res.setHeader("Content-Type", "audio/mpeg");
            return res.send(audioBuf);
          }
          
          // Try raw base64 string decoding
          try {
            const decoded = Buffer.from(textStr.trim(), "base64");
            if (decoded.length > 100) {
              res.setHeader("Content-Type", "audio/mpeg");
              return res.send(decoded);
            }
          } catch {}
        }
      }

      // Default: Return binary audio
      res.setHeader("Content-Type", "audio/mpeg");
      return res.send(buffer);

    } catch (error: any) {
      console.error("Server error handling TTS:", error);
      return res.status(500).json({ error: error?.message || "Internal server error" });
    }
  });

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "Fish Audio Studio API" });
  });

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Fish Audio Studio server running on http://localhost:${PORT}`);
  });
}

startServer();
