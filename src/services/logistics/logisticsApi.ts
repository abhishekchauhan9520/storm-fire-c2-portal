import { Router } from "express";
import { stormFireLogisticsService } from "./logisticsService";

export const logisticsRouter = Router();

logisticsRouter.get("/resources", (_req, res) => {
  res.json({ data: stormFireLogisticsService.listResources() });
});

logisticsRouter.get("/requests", (req, res) => {
  const status = typeof req.query.status === "string" ? req.query.status as any : undefined;
  res.json({ data: stormFireLogisticsService.listRequests(status) });
});

logisticsRouter.post("/resources", (req, res) => {
  try {
    const resource = stormFireLogisticsService.registerResource(req.body);
    res.status(201).json({ data: resource });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Invalid resource." });
  }
});

logisticsRouter.post("/requests", (req, res) => {
  try {
    const request = stormFireLogisticsService.createRequest(req.body);
    res.status(201).json({ data: request });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Invalid logistics request." });
  }
});

logisticsRouter.patch("/requests/:id/status", (req, res) => {
  try {
    const request = stormFireLogisticsService.updateRequestStatus(req.params.id, req.body?.status);
    res.json({ data: request });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Invalid request status." });
  }
});
