// server/routes.ts
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { messageSchema, insertVapiLogSchema, scheduledCall } from "@shared/schema";
import { supabase } from "./supabase";
import { cronService } from './cron';
import { z } from 'zod';

export function registerRoutes(app: Express): Server {
  // Get all calls
  app.get("/api/calls", async (_req, res) => {
    const calls = await storage.getCalls();
    res.json(calls);
  });

  // Get all agents
  // Get total costs for today
  app.get("/api/costs-today", async (_req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('vapi_logs')
      .select('costs')
      .gte('created_at', today)
      .lt('created_at', new Date(new Date().setDate(new Date().getDate() + 1)).toISOString());

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const totalCosts = data.reduce((sum, log) => sum + (log.costs || 0), 0);
    res.json({ total: totalCosts });
  });

  app.get("/api/agents", async (_req, res) => {
  
    const { data, error } = await supabase
      .from('vapi_agents')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('API: Error fetching agents:', error);
      return res.status(500).json({ error: error.message });
    }
    
    res.json(data || []);
  });

  // Get all logs
  app.get("/api/logs", async (_req, res) => {
  
    const { data, error } = await supabase
    .from('vapi_logs')
    .select(`
      *,
      vapi_scheduled_calls!left(
        topic,
        customer_name,
        phone_number
      )
    `)
    .order('created_at', { ascending: false })
    
    if (error) {
      console.error('API: Error fetching logs:', error);
      return res.status(500).json({ error: error.message });
    }

    const flattenedData = data?.map(item => ({
      ...item,
      ...item.vapi_scheduled_calls,
      vapi_scheduled_calls: undefined // Remove the nested object
    }));

    const statusMap = {
      'in-progress': 'in_call',
      'queued': 'scheduled',
      'forwarding': 'in_call',
      'ended': 'finished'
    };

    const mappedData = (flattenedData || []).map(log => ({
      ...log,
      status: statusMap[log.status] || log.status
    }));
    
    res.json(mappedData);
  });

  // VAPI webhook endpoint
  app.post("/api/webhook", async (req, res) => {

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

  // Endpoint to initiate a call
  app.post("/api/call", async (req, res) => {
    const { scheduled_call_id } = req.body;

    try {
      // 1. Get scheduled call details
      const { data: scheduledCall, error: scheduledCallError } = await supabase
        .from('vapi_scheduled_calls')
        .select('*')
        .eq('id', scheduled_call_id)
        .single();

      if (scheduledCallError || !scheduledCall) {
        throw new Error(scheduledCallError?.message || 'Scheduled call not found');
      }

      // 2. Get agent ID
      const { data: agent, error: agentError } = await supabase
        .from('vapi_agents')
        .select('agent_id')
        .eq('name', scheduledCall.agent_name)
        .single();

      if (agentError || !agent) {
        throw new Error(agentError?.message || 'Agent not found');
      }

      console.log(`Agent ${agent.name} is calling ${scheduledCall.customer_name} at ${scheduledCall.phone_number});`)

      // 3. Call VAPI API
      const response = await fetch('https://api.vapi.ai/call', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.VAPI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          assistantId: agent.agent_id,
          phoneNumberId: "dcfc2e60-9d68-45ea-8e26-22c79f80287b",
          customer: {
            number: scheduledCall.phone_number
          }
        })
      });

      const data = await response.json();
      
      if (!response.ok || data.type !== 'outboundPhoneCall') {
        throw new Error(`VAPI API call failed: ${response.statusText}`);
      }

      // 4. Log the call
      console.log(`CALL TO ${scheduledCall.phone_number} initiated with agent ${scheduledCall.agent_name}`);

      res.json({ success: true });
    } catch (error) {
      console.error('Call initiation error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get current cron configuration
  app.get("/api/cron/config", (_req, res) => {
    const config = cronService.getConfig();
    res.json(config);
  });

  // Update cron configuration
  const cronConfigSchema = z.object({
    schedule: z.string(),
    endpoint: z.string().url(),
    enabled: z.boolean()
  }).partial();

  app.post("/api/cron/config", (req, res) => {
    const result = cronConfigSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    try {
      cronService.updateConfig(result.data);
      res.json({ message: 'Cron configuration updated successfully' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}