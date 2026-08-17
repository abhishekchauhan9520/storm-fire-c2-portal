import express from "express";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { createStormFireRuntime } from "./src/core/stormFireRuntime";
import { stormFireAuthorization } from "./src/domain/authorizationPolicy";
import { buildDynamicCopFromFabric } from "./src/domain/dynamicCopFromFabric";
import { resolveParticipantOperationalContext } from "./src/domain/participantOperationalContext";
import { buildStormFireAdvisoryContext, generateBoundedAdvisory } from "./src/domain/aiDecisionSupport";
import { logisticsRouter } from "./src/services/logistics/logisticsApi";
import { stormFireLogisticsService } from "./src/services/logistics/logisticsService";
import { bootstrapStormFireDevelopmentScenario } from "./src/platform/stormFireBootstrap";
import { stormFireServiceFabric } from "./src/service-fabric/serviceFabric";
import type { CanonicalOperationalObject } from "./src/types";

dotenv.config({ path: ".env.local" });
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);
const runtime = createStormFireRuntime();
app.use(express.json({ limit: "1mb" }));

if (process.env.NODE_ENV !== "production" || process.env.STORM_FIRE_BOOTSTRAP_SCENARIO === "true") {
  bootstrapStormFireDevelopmentScenario();
}

app.get("/api/health", (_req, res) => res.json({ status: "ok", architecture: "storm-fire-information-centric", runtime: "operational", persistence: "adapter-boundary", counts: { participants: runtime.state.participants.length, objects: runtime.state.objects.length, events: runtime.state.events.length, alerts: runtime.state.alerts.length, logisticsRequests: stormFireLogisticsService.listRequests().length } }));
app.get("/api/runtime/state", (_req, res) => res.json(runtime.state));
app.get("/api/participants", (_req, res) => res.json(runtime.state.participants));
app.get("/api/objects", (_req, res) => res.json(runtime.state.objects));
app.get("/api/events", (_req, res) => res.json(runtime.state.events));
app.get("/api/alerts", (_req, res) => res.json(runtime.state.alerts));
app.get("/api/services", (_req, res) => res.json(stormFireServiceFabric.list()));
app.use("/api/logistics", logisticsRouter);

app.get("/api/participant-context/:participantId", (req, res) => {
  try {
    const context = resolveParticipantOperationalContext(req.params.participantId);
    return res.json({ data: context });
  } catch (error) {
    return res.status(404).json({ error: error instanceof Error ? error.message : "Participant context not found." });
  }
});

app.post("/api/access/decide", (req, res) => {
  try { return res.json({ data: stormFireAuthorization.decide(req.body) }); }
  catch (error) { return res.status(400).json({ error: error instanceof Error ? error.message : "Invalid authorization request." }); }
});

app.get("/api/cop/:participantId", (req, res) => {
  try {
    const operationalContext = resolveParticipantOperationalContext(req.params.participantId);
    return res.json({ data: buildDynamicCopFromFabric(operationalContext) });
  } catch (error) {
    return res.status(404).json({ error: error instanceof Error ? error.message : "Canonical participant context is unavailable." });
  }
});

app.post("/api/objects", (req, res) => {
  const object = req.body as CanonicalOperationalObject;
  if (!object?.id || !object?.kind || !object?.sourceParticipantId || !object?.timestamp) return res.status(400).json({ error: "Canonical object requires id, kind, timestamp and sourceParticipantId." });
  return res.status(202).json(runtime.ingestObject(object));
});
app.post("/api/alerts", (req, res) => {
  if (!req.body?.id || !req.body?.objectId) return res.status(400).json({ error: "Alert requires id and objectId." });
  return res.status(202).json(runtime.publishAlert(req.body));
});

/**
 * AI/decision support accepts only a participant context and a question.
 * It derives the input from the participant's authorized Dynamic COP and
 * never receives arbitrary React state.
 */
app.post("/api/advisory", (req, res) => {
  try {
    const participantId = typeof req.body?.participantId === "string" ? req.body.participantId : "";
    const question = typeof req.body?.userQuery === "string" ? req.body.userQuery.trim() : "";
    if (!participantId) return res.status(400).json({ error: "participantId is required." });

    const context = resolveParticipantOperationalContext(participantId);
    const cop = buildDynamicCopFromFabric(context);
    const advisoryContext = buildStormFireAdvisoryContext(cop);

    return res.json({
      response: generateBoundedAdvisory(advisoryContext, question),
      participantId,
      context: advisoryContext,
    });
  } catch (error) {
    return res.status(403).json({ error: error instanceof Error ? error.message : "Authorized decision-support context unavailable." });
  }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => res.sendFile(path.join(distPath, "index.html")));
  }
  app.listen(PORT, "0.0.0.0", () => console.log(`[STORM-FIRE] Information runtime operational on port ${PORT}`));
}
startServer().catch((error) => { console.error("Failed to start Storm Fire runtime:", error); process.exit(1); });