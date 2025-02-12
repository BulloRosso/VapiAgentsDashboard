import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { messageSchema, insertVapiLogSchema, scheduledCall } from "@shared/schema";
import { supabase } from "./supabase";

export function registerRoutes(app: Express): Server {
  // Get all calls
  app.get("/api/calls", async (_req, res) => {
    const calls = await storage.getCalls();
    res.json(calls);
  });

  // Get all agents
  app.get("/api/agents", async (_req, res) => {
    console.log('API: Fetching agents from Supabase...');
    const { data, error } = await supabase
      .from('vapi_agents')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('API: Error fetching agents:', error);
      return res.status(500).json({ error: error.message });
    }
    
    console.log('API: Successfully fetched agents:', data);
    res.json(data || []);
  });

  // Get all logs
  app.get("/api/logs", async (_req, res) => {
    console.log('API: Fetching logs from Supabase...');
    const { data, error } = await supabase
      .from('vapi_logs')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('API: Error fetching logs:', error);
      return res.status(500).json({ error: error.message });
    }
    
    res.json(data || []);
  });

  // VAPI webhook endpoint
  app.post("/api/webhook", async (req, res) => {
    console.log(JSON.stringify(req.body));

    const result = messageSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    const { message } = result.data;

    try {
      if (message.type === 'status-update') {
        const { data, error } = await supabase
          .from('vapi_logs')
          .upsert({
            call_id: message.call.id,
            status: message.status,
            agent_id: message.call.assistantId,
            messages: message.artifact?.messages
          }, {
            onConflict: 'call_id'
          })
          .select();

        if (error) throw error;
        res.json(data[0]);

      } else if (message.type === 'end-of-call-report') {
        const { data, error } = await supabase
          .from('vapi_logs')
          .upsert({
            call_id: message.call.id,
            status: 'ended',
            agent_id: message.call.assistantId,
            duration_seconds: message.durationSeconds ? Math.round(message.durationSeconds) : null,
            cost: message.cost,
            messages: message.artifact?.messages,
            transcript: message.artifact?.transcript,
            summary: message.analysis?.summary
          }, {
            onConflict: 'call_id'
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

  // Get all scheduled calls for today
  app.get("/api/scheduled-calls-today", async (_req, res) => {
    const { data, error } = await supabase
      .from('vapi_scheduled_calls')
      .select('*')
      .gte('call_time', new Date().toISOString().split('T')[0])
      .lt('call_time', new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0])
      .order('call_time', { ascending: true });

    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json(data || []);
  });

  // Create scheduled call
  app.post("/api/scheduled-calls", async (req, res) => {
    const result = scheduledCall.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    const { data, error } = await supabase
      .from('vapi_scheduled_calls')
      .insert([result.data])
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json(data);
  });

  // Update scheduled call
  app.put("/api/scheduled-calls/:id", async (req, res) => {
    const result = scheduledCall.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    const { data, error } = await supabase
      .from('vapi_scheduled_calls')
      .update(result.data)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json(data);
  });

  // Delete scheduled call
  app.delete("/api/scheduled-calls/:id", async (req, res) => {
    const { error } = await supabase
      .from('vapi_scheduled_calls')
      .delete()
      .eq('id', req.params.id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.status(204).send();
  });

  const httpServer = createServer(app);
  return httpServer;
}