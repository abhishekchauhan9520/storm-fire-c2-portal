import express, { type Request } from "express";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { createStormFireRuntime } from "./src/core/stormFireRuntime";
import { stormFireAuthorization } from "./src/domain/authorizationPolicy";
import { authorizeAlertDissemination } from "./src/domain/alertAuthorization";
import { buildDynamicCopFromFabric } from "./src/domain/dynamicCopFromFabric";
import { resolveParticipantOperationalContext } from "./src/domain/participantOperationalContext";
import { buildStormFireAdvisoryContext, generateBoundedAdvisory } from "./src/domain/aiDecisionSupport";
import { stormFireInformationFabric } from "./src/domain/informationFabric";
import { FileInformationFabricPersistence } from "./src/platform/persistence/informationFabricPersistence";
import { logisticsRouter } from "./src/services/logistics/logisticsApi";
import { logisticsRepositoryReady, logisticsService as stormFireLogisticsService } from "./src/services/logistics/logisticsContainer";
import { bootstrapStormFireDevelopmentScenario } from "./src/platform/stormFireBootstrap";
import { stormFireServiceFabric } from "./src/service-fabric/serviceFabric";
import { stormFireEventSpine } from "./src/platform/event-spine/eventSpine";
import { stormFireParticipantEventStream } from "./src/platform/realtime/participantEventStream";
import { dispatchParticipantEvent } from "./src/platform/realtime/participantEventDispatch";
import type { CanonicalOperationalObject } from "./src/types";

dotenv.config({ path: ".env.local" });
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);
const runtime = createStormFireRuntime({}, stormFireInformationFabric);
const isProduction = process.env.NODE_ENV === "production";
const developmentParticipantId = process.env.STORM_FIRE_DEV_PARTICIPANT_ID || "operator-command";
app.use(express.json({ limit: "1mb" }));

if (!isProduction || process.env.STORM_FIRE_BOOTSTRAP_SCENARIO === "true") {
  bootstrapStormFireDevelopmentScenario();
}

function authenticatedParticipantId(req: Request): string | null {
  if (isProduction) return null;
  const claimed = req.header("x-storm-fire-participant-id");
  const participantId = claimed || developmentParticipantId;
  return participantId || null;
}

function requireParticipant(req: Request, res: express.Response, next?: express.NextFunction): string | null {
  const participantId = authenticatedParticipantId(req);
  if (!participantId) {
    res.status(401).json({ error: "Authenticated participant identity is required for operational data access." });
    return null;
  }
  try {
    resolveParticipantOperationalContext(participantId);
  } catch (error) {
    res.status(403).json({ error: error instanceof Error ? error.message : "Participant context is unavailable." });
    return null;
  }
  res.locals.stormFireParticipantId = participantId;
  if (next) next();
  return participantId;
}

function requireParticipantMiddleware(req: Request, res: express.Response, next: express.NextFunction): void {
  requireParticipant(req, res, next);
}

for (const eventType of ["LogisticsResourceRegistered", "LogisticsRequestCreated", "LogisticsRequestStatusChanged", "LogisticsRequestStatusReaffirmed"]) {
  stormFireEventSpine.subscribe(eventType, (event) => {
    dispatchParticipantEvent(event);
  });
}

app.get("/api/health", (_req, res) => {
  const base = { status: "ok", architecture: "storm-fire-information-centric", runtime: "operational", persistence: "adapter-boundary" };
  if (isProduction) return res.json(base);
  return res.json({
    ...base,
    environment: "development",
    counts: {
      participants: runtime.state.participants.length,
      objects: runtime.state.objects.length,
      events: runtime.state.events.length,
      alerts: runtime.state.alerts.length,
      logisticsRequests: stormFireLogisticsService.listRequests().length,
      realtimeSubscribers: stormFireParticipantEventStream.listenerCount(),
    },
  });
});

app.get("/api/services", (_req, res) => res.json(stormFireServiceFabric.list()));
app.use("/api/logistics", requireParticipantMiddleware, logisticsRouter);

app.get("/api/events/stream", (req, res) => {
  const participantId = requireParticipant(req, res);
  if (!participantId) return;

  res.status(200);
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-store, max-age=0, must-revalidate");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();
  res.write(`event: stream.ready\ndata: ${JSON.stringify({ participantId })}\n\n`);

  const unsubscribe = stormFireParticipantEventStream.subscribe(participantId, (event) => {
    if (res.writableEnded) return;
    res.write(`event: cop.invalidate\ndata: ${JSON.stringify(event)}\n\n`);
  });
  const heartbeat = setInterval(() => {
    if (!res.writableEnded) res.write(": heartbeat\n\n");
  }, 15000);

  req.on("close", () => {
    clearInterval(heartbeat);
    unsubscribe();
    res.end();
  });
});

app.get("/api/participant-context/:participantId", (req, res) => {
  const authenticatedId = requireParticipant(req, res);
  if (!authenticatedId) return;
  if (authenticatedId !== req.params.participantId) return res.status(403).json({ error: "Participant context does not match the authenticated identity." });
  try {
    const context = resolveParticipantOperationalContext(authenticatedId);
    return res.json({ data: context });
  } catch (error) {
    return res.status(404).json({ error: error instanceof Error ? error.message : "Participant context not found." });
  }
});

app.post("/api/access/decide", (req, res) => {
  const authenticatedId = requireParticipant(req, res);
  if (!authenticatedId) return;
  if (req.body?.participantId !== authenticatedId) return res.status(403).json({ error: "Authorization subject does not match the authenticated identity." });

  try {
    const canonicalContext = resolveParticipantOperationalContext(authenticatedId);
    const informationType = typeof req.body?.informationType === "string" ? req.body.informationType.trim() : "";
    if (!informationType) return res.status(400).json({ error: "Authorization request requires informationType." });

    const requestedServiceId = typeof req.body?.serviceId === "string" ? req.body.serviceId : undefined;
    if (requestedServiceId && !canonicalContext.services.some((service) => service.id === requestedServiceId)) {
      return res.status(403).json({ error: "Requested service is not part of the authenticated participant context." });
    }

    const request = {
      requestId: typeof req.body?.requestId === "string" && req.body.requestId.trim() ? req.body.requestId : `access-${Date.now()}`,
      participantId: authenticatedId,
      informationType,
      serviceId: requestedServiceId,
      organizationIds: canonicalContext.organizationIds,
      roleIds: canonicalContext.roleIds,
      relationshipIds: canonicalContext.relationshipIds,
      geographicScopeIds: canonicalContext.geographicScopeIds,
      classification: canonicalContext.informationClassification,
    };

    return res.json({ data: stormFireAuthorization.decide(request) });
  } catch (error) {
    return res.status(400).json({ error: error instanceof Error ? error.message : "Invalid authorization request." });
  }
});

app.get("/api/cop/:participantId", (req, res) => {
  const authenticatedId = requireParticipant(req, res);
  if (!authenticatedId) return;
  if (authenticatedId !== req.params.participantId) return res.status(403).json({ error: "COP participant does not match the authenticated identity." });
  try {
    const operationalContext = resolveParticipantOperationalContext(authenticatedId);
    res.setHeader("Cache-Control", "no-store, max-age=0");
    return res.json({ data: buildDynamicCopFromFabric(operationalContext) });
  } catch (error) {
    return res.status(404).json({ error: error instanceof Error ? error.message : "Canonical participant context is unavailable." });
  }
});

app.post("/api/objects", (req, res) => {
  const authenticatedId = requireParticipant(req, res);
  if (!authenticatedId) return;
  const object = req.body as CanonicalOperationalObject;
  if (object?.sourceParticipantId !== authenticatedId) return res.status(403).json({ error: "Object source participant does not match the authenticated identity." });
  if (!object?.id || !object?.kind || !object?.sourceParticipantId || !object?.timestamp) return res.status(400).json({ error: "Canonical object requires id, kind, timestamp and sourceParticipantId." });
  return res.status(202).json(runtime.ingestObject(object));
});

app.post("/api/alerts", (req, res) => {
  const authenticatedId = requireParticipant(req, res);
  if (!authenticatedId) return;
  const recipientIds = Array.isArray(req.body?.recipients) ? req.body.recipients : [];
  if (!recipientIds.includes(authenticatedId)) return res.status(403).json({ error: "Alert recipient list must include the authenticated participant." });
  if (!req.body?.id || !req.body?.objectId) return res.status(400).json({ error: "Alert requires id and objectId." });

  const object = runtime.state.objects.find((candidate) => candidate.id === req.body.objectId);
  if (!object) return res.status(404).json({ error: "Alert object is not present in the canonical Information Fabric projection." });

  try {
    const serviceId = typeof req.body?.serviceId === "string" ? req.body.serviceId : undefined;
    const authorization = authorizeAlertDissemination({
      issuerParticipantId: authenticatedId,
      recipientParticipantIds: recipientIds,
      informationObject: object,
      serviceId,
    });

    if (authorization.deniedRecipientIds.length > 0) {
      return res.status(403).json({
        error: "Alert dissemination is not authorized for one or more requested recipients.",
        deniedRecipientIds: authorization.deniedRecipientIds,
        allowedRecipientIds: authorization.allowedRecipientIds,
        matchedPolicyIds: authorization.matchedPolicyIds,
      });
    }

    return res.status(202).json(runtime.publishAlert({ ...req.body, recipients: authorization.allowedRecipientIds }));
  } catch (error) {
    return res.status(403).json({ error: error instanceof Error ? error.message : "Alert dissemination authorization failed." });
  }
});

app.post("/api/advisory", (req, res) => {
  const authenticatedId = requireParticipant(req, res);
  if (!authenticatedId) return;
  try {
    if (req.body?.participantId !== authenticatedId) return res.status(403).json({ error: "Advisory participant does not match the authenticated identity." });
    const question = typeof req.body?.userQuery === "string" ? req.body.userQuery.trim() : "";
    const context = resolveParticipantOperationalContext(authenticatedId);
    const cop = buildDynamicCopFromFabric(context);
    const advisoryContext = buildStormFireAdvisoryContext(cop);
    return res.json({ response: generateBoundedAdvisory(advisoryContext, question), participantId: authenticatedId, context: advisoryContext });
  } catch (error) {
    return res.status(403).json({ error: error instanceof Error ? error.message : "Authorized decision-support context unavailable." });
  }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
async function startServer() {
  await logisticsRepositoryReady;
  await stormFireInformationFabric.attachPersistence(new FileInformationFabricPersistence());
  if (!isProduction) {
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
