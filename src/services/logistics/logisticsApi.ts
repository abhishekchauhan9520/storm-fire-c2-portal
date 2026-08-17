import { Router } from "express";
import { logisticsService } from "./logisticsContainer";
import type { LogisticsRequestStatus } from "./logisticsService";

export const logisticsRouter = Router();

const validStatuses = new Set<LogisticsRequestStatus>(["OPEN", "PRIORITIZED", "IN_PROGRESS", "FULFILLED", "CANCELLED"]);

logisticsRouter.get("/resources", (_req, res) => res.json({ data: logisticsService.listResources() }));

logisticsRouter.get("/requests", (req, res) => {
  const rawStatus = typeof req.query.status === "string" ? req.query.status : undefined;
  if (rawStatus && !validStatuses.has(rawStatus as LogisticsRequestStatus)) return res.status(400).json({ error: "Invalid logistics request status." });
  return res.json({ data: logisticsService.listRequests(rawStatus as LogisticsRequestStatus | undefined) });
});

logisticsRouter.post("/resources", (req, res) => {
  try { return res.status(201).json({ data: logisticsService.registerResource(req.body) }); }
  catch (error) { return res.status(400).json({ error: error instanceof Error ? error.message : "Invalid resource." }); }
});

logisticsRouter.post("/requests", (req, res) => {
  try { return res.status(201).json({ data: logisticsService.createRequest(req.body) }); }
  catch (error) { return res.status(400).json({ error: error instanceof Error ? error.message : "Invalid logistics request." }); }
});

logisticsRouter.patch("/requests/:id/status", (req, res) => {
  try {
    const status = req.body?.status;
    if (!validStatuses.has(status)) return res.status(400).json({ error: "Invalid logistics request status." });
    return res.json({ data: logisticsService.updateRequestStatus(req.params.id, status) });
  } catch (error) { return res.status(400).json({ error: error instanceof Error ? error.message : "Invalid request status." }); }
});
