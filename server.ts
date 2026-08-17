import express from "express";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { createStormFireRuntime } from "./src/core/stormFireRuntime";
import { stormFireAuthorization } from "./src/domain/authorizationPolicy";
import { stormFireInformationFabric } from "./src/domain/informationFabric";
import { buildDynamicCopFromFabric } from "./src/domain/dynamicCopFromFabric";
import { resolveParticipantOperationalContext } from "./src/domain/participantOperationalContext";
import { logisticsRouter } from "./src/services/logistics/logisticsApi";
import { stormFireLogisticsService } from "./src/services/logistics/logisticsService";
import type { CanonicalOperationalObject } from "./src/types";

dotenv.config({ path: ".env.local" });
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);
const runtime = createStormFireRuntime();
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => res.json({ status: "ok", architecture: "storm-fire-information-centric", runtime: "operational", persistence: "adapter-boundary", counts: { participants: runtime.state.participants.length, objects: runtime.state.objects.length, events: runtime.state.events.length, alerts: runtime.state.alerts.length, logisticsRequests: stormFireLogisticsService.listRequests().length } }));
app.get("/api/runtime/state", (_req, res) => res.json(runtime.state));
app.get("/api/participants", (_req, res) => res.json(runtime.state.participants));
app.get("/api/objects", (_req, res) => res.json(runtime.state.objects));
app.get("/api/events", (_req, res) => res.json(runtime.state.events));
app.get("/api/alerts", (_req, res) => res.json(runtime.state.alerts));
app.get("/api/services", (_req, res) => res.json(runtime.state.services));
app.use("/api/logistics", logisticsRouter);

app.get("/api/participant-context/:participantId", (req, res) => {
  const context = runtime.resolveParticipantContext(req.params.participantId);
  if (!context) return res.status(404).json({ error: "Participant context not found." });
  return res.json({ data: context });
});

app.post("/api/access/decide", (req, res) => {
  try { return res.json({ data: stormFireAuthorization.decide(req.body) }); }
  catch (error) { return res.status(400).json({ error: error instanceof Error ? error.message : "Invalid authorization request." }); }
});

app.get("/api/cop/:participantId", (req, res) => {
  const context = runtime.resolveParticipantContext(req.params.participantId);
  if (!context || context.organizationIds.length === 0 || context.roleIds.length === 0) return res.status(404).json({ error: "A resolved participant context with organization and role is required." });
  const capabilities = context.serviceIds.flatMap((serviceId) => runtime.state.services.find((service) => service.id === serviceId)?.capabilities.map((capability) => capability.id) ?? []);
  const operationalContext = resolveParticipantOperationalContext({ participantId: context.participantId, organizationId: context.organizationIds[0], roleId: context.roleIds[0], geographicScopeIds: context.geographicScopeIds, relationshipIds: context.informationRelationshipIds, serviceIds: context.serviceIds, capabilities });
  return res.json({ data: buildDynamicCopFromFabric(operationalContext) });
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
app.post("/api/advisory", (req, res) => {
  const objectCount = runtime.state.objects.length;
  const alertCount = runtime.state.alerts.filter((alert) => alert.state !== "RESOLVED").length;
  res.json({ response: `Storm Fire information review: ${objectCount} canonical objects and ${alertCount} unresolved alerts are currently available. Validate provenance, freshness, authorization, relationship routing, and operator acknowledgement before acting.`, participantId: req.body?.participantId ?? null });
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
