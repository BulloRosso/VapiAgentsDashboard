import { pgTable, text, serial, timestamp, jsonb, integer, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const callStatus = z.enum(['scheduled', 'in_call', 'waiting_callback', 'finished']);
export type CallStatus = z.infer<typeof callStatus>;

export const calls = pgTable("calls", {
  id: serial("id").primaryKey(),
  status: text("status").notNull(),
  customer: text("customer").notNull(),
  phoneNumber: text("phone_number"),
  topic: text("topic"),
  scheduledTime: text("scheduled_time"),
  agent: text("agent"),
  timeInStatus: text("time_in_status").notNull(),
  duration: integer("duration"),
  nextAction: text("next_action")
});

export const insertCallSchema = createInsertSchema(calls, {
  id: z.number(),
  status: z.string(),
  customer: z.string(),
  phoneNumber: z.string().nullable(),
  topic: z.string().nullable(),
  scheduledTime: z.string().nullable(),
  agent: z.string().nullable(),
  timeInStatus: z.string(),
  duration: z.number().nullable(),
  nextAction: z.string().nullable()
}).omit({ id: true });

export type InsertCall = z.infer<typeof insertCallSchema>;
export type Call = typeof calls.$inferSelect;

export const callReports = pgTable("call_reports", {
  id: serial("id").primaryKey(),
  callId: integer("call_id").notNull(),
  summary: text("summary").notNull(),
  duration: integer("duration").notNull(),
  timestamp: timestamp("timestamp").notNull()
});

export const insertCallReportSchema = createInsertSchema(callReports, {
  id: z.number(),
  callId: z.number(),
  summary: z.string(),
  duration: z.number(),
  timestamp: z.date()
}).omit({ id: true });

export type InsertCallReport = z.infer<typeof insertCallReportSchema>;
export type CallReport = typeof callReports.$inferSelect;

export const vapiLogs = pgTable("vapi_logs", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  callId: text("call_id").notNull(),
  status: text("status").default('in-progress'),
  agentId: text("agent_id"),
  durationSeconds: integer("duration_seconds"),
  cost: numeric("costs"),
  messages: jsonb("messages"),
  transcript: text("transcript"),
  summary: text("summary")
});

export const insertVapiLogSchema = createInsertSchema(vapiLogs, {
  id: z.number(),
  createdAt: z.date(),
  status: z.string().nullable(),
  agentId: z.string().nullable(),
  durationSeconds: z.string().nullable(),
  messages: z.any().nullable(),
  summary: z.string().nullable()
}).omit({ 
  id: true,
  createdAt: true
});

export type InsertVapiLog = z.infer<typeof insertVapiLogSchema>;
export type VapiLog = typeof vapiLogs.$inferSelect;

// Message type for the VAPI webhooks
import { z } from 'zod';

export const messageSchema = z.object({
  message: z.object({
    timestamp: z.number(),
    type: z.enum(['status-update', 'end-of-call-report']),
    status: z.enum(['in-progress', 'queued', 'forwarding', 'ended']).optional(),
    endedReason: z.string().optional(),
    call: z.object({
      id: z.string(),
      assistantId: z.string(),
      orgId: z.string(),
      type: z.string(),
      status: z.string(),
    }).passthrough(),
    assistant: z.object({
      name: z.string(),
      transcriber: z.any(),
      model: z.any(),
      voice: z.any(),
    }).passthrough(),
    artifact: z.object({
      messages: z.array(z.any()),
      messagesOpenAIFormatted: z.array(z.any())
    }).optional(),
    analysis: z.record(z.any()).optional(),
    cost: z.number().optional(),
    durationSeconds: z.number().optional(),
    costBreakdown: z.any().optional(),
    transcript: z.string().optional()
  })
});

export type VapiMessage = z.infer<typeof messageSchema>;