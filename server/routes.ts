import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { messageSchema, insertVapiLogSchema } from "@shared/schema";

export function registerRoutes(app: Express): Server {
  // Get all calls
  app.get("/api/calls", async (_req, res) => {
    const calls = await storage.getCalls();
    res.json(calls);
  });

  // Get all logs
  app.get("/api/logs", async (_req, res) => {
    const logs = await storage.getLogs();
    res.json(logs);
  });

  // VAPI webhook endpoint
  app.post("/api/webhook", async (req, res) => {
    const result = messageSchema.safeParse(req.body.message);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    const message = result.data;

    try {
      if (message.type === 'status-update') {
        const log = {
          status: message.status,
          agentId: message.call.agentId,
        };

        const result = insertVapiLogSchema.partial().safeParse(log);
        if (!result.success) {
          return res.status(400).json({ error: result.error });
        }

        const created = await storage.createLog(result.data);
        res.json(created);
      } else if (message.type === 'end-of-call-report') {
        const log = {
          status: 'ended',
          agentId: message.call.agentId,
          durationSeconds: message.call.duration?.toString(),
          messages: message.messages,
          summary: message.summary
        };

        const result = insertVapiLogSchema.partial().safeParse(log);
        if (!result.success) {
          return res.status(400).json({ error: result.error });
        }

        const created = await storage.createLog(result.data);
        res.json(created);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to process webhook" });
    }
  });


  // Schedule new call
  app.post("/api/calls", async (req, res) => {
    const result = insertCallSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    const call = await storage.createCall(result.data);
    res.json(call);
  });

  const httpServer = createServer(app);
  return httpServer;
}