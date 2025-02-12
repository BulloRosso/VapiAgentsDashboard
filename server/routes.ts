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
    console.log(req.body.message);
    
    const result = messageSchema.safeParse(req.body.message);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    const message = result.data;

    try {
      if (message.type === 'status-update') {
        const clientStatus = message.status === 'in-progress' ? 'in_call' : 
                           message.status === 'forwarding' ? 'waiting_callback' :
                           message.status === 'ended' ? 'finished' : 'scheduled';

        const { data, error } = await supabase
          .from('vapi_logs')
          .upsert({
            call_id: message.call.id,
            vapi_status: message.status,
            client_status: clientStatus,
            agent_id: message.call.assistantId,
          })
          .select();

        if (error) throw error;
        res.json(data[0]);

      } else if (message.type === 'end-of-call-report') {
        const totalCost = message.costs.reduce((sum, item) => sum + item.cost, 0);
        
        const { data, error } = await supabase
          .from('vapi_logs')
          .upsert({
            call_id: message.call.id,
            vapi_status: 'ended',
            client_status: 'finished',
            agent_id: message.call.assistantId,
            duration_seconds: message.durationSeconds,
            costs: totalCost,
            transcript: message.transcript,
            summary: message.summary,
          })
          .select();

        if (error) throw error;
        res.json(data[0]);
      }
    } catch (error) {
      console.error('Webhook error:', error);
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