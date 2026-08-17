import { Router } from "express";
import { stormFireAuthorization } from "../../domain/authorizationPolicy";
import { logisticsService } from "./logisticsContainer";
import type { LogisticsRequestStatus } from "./logisticsService";

export const logisticsRouter = Router();

const validStatuses = new Set<LogisticsRequestStatus>(["OPEN", "PRIORITIZED", "IN_PROGRESS", "FULFILLED", "CANCELLED"]);
type LogisticsInformationType = "ResourceStatus" | "LogisticsRequest" | "LogisticsAlert";

function requireCapability(res: import("express").Response, informationType: LogisticsInformationType): string | null {
  const id = res.locals.stormFireParticipantId;
  if (typeof id !== "string" || !id) {
    res.status(401).json({ error: "Authenticated participant identity is required." });
    return null;
  }

  const decision = stormFireAuthorization.decide({
    requestId: `logistics-api:${informationType}:${id}:${Date.now()}`,
    participantId: id,
    informationType,
    serviceId: "logistics",
  });

  if (!decision.allowed) {
    res.status(403).json({
      error: `Participant is not authorized for ${informationType}.`,
      reason: decision.reason,
      matchedRuleIds: decision.matchedRuleIds,
    });
    return null;
  }

  return id;
}

logisticsRouter.get("/resources", (_req, res) => {
  if (!requireCapability(res, "ResourceStatus")) return;
  return res.json({ data: logisticsService.listResources() });
});

logisticsRouter.get("/requests", (req, res) => {
  if (!requireCapability(res, "LogisticsRequest")) return;
  const rawStatus = typeof req.query.status === "string" ? req.query.status : undefined;
  if (rawStatus && !validStatuses.has(rawStatus as LogisticsRequestStatus)) return res.status(400).json({ error: "Invalid logistics request status." });
  return res.json({ data: logisticsService.listRequests(rawStatus as LogisticsRequestStatus | undefined) });
});

logisticsRouter.post("/resources", (req, res) => {
  if (!requireCapability(res, "ResourceStatus")) return;
  try { return res.status(201).json({ data: logisticsService.registerResource(req.body) }); }
  catch (error) { return res.status(400).json({ error: error instanceof Error ? error.message : "Invalid resource." }); }
});

logisticsRouter.post("/requests", (req, res) => {
  const authenticatedId = requireCapability(res, "LogisticsRequest");
  if (!authenticatedId) return;
  if (req.body?.requesterParticipantId !== authenticatedId) {
    return res.status(403).json({ error: "Logistics request requester does not match the authenticated participant." });
  }
  try { return res.status(201).json({ data: logisticsService.createRequest(req.body) }); }
  catch (error) { return res.status(400).json({ error: error instanceof Error ? error.message : "Invalid logistics request." }); }
});

logisticsRouter.patch("/requests/:id/status", (req, res) => {
  const authenticatedId = requireCapability(res, "LogisticsRequest");
  if (!authenticatedId) return;

  try {
    const status = req.body?.status;
    if (!validStatuses.has(status)) return res.status(400).json({ error: "Invalid logistics request status." });
    const existing = logisticsService.listRequests().find((request) => request.id === req.params.id);
    if (!existing) return res.status(404).json({ error: `Logistics request ${req.params.id} was not found.` });
    if (existing.requesterParticipantId !== authenticatedId) return res.status(403).json({ error: "Only the authenticated requester may change this logistics request status." });
    return res.json({ data: logisticsService.updateRequestStatus(req.params.id, status) });
  } catch (error) { return res.status(400).json({ error: error instanceof Error ? error.message : "Invalid request status." }); }
});
