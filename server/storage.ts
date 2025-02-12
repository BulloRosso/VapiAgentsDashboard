import { calls, callReports, type Call, type InsertCall, type CallReport, type InsertCallReport } from "@shared/schema";
import { vapiLogs, type VapiLog, type InsertVapiLog, type VapiMessage } from "@shared/schema";

export interface IStorage {
  getCalls(): Promise<Call[]>;
  getCall(id: number): Promise<Call | undefined>;
  createCall(call: InsertCall): Promise<Call>;
  updateCall(id: number, call: Partial<InsertCall>): Promise<Call>;
  createCallReport(report: InsertCallReport): Promise<CallReport>;
  getLogs(): Promise<VapiLog[]>;
  getLog(id: number): Promise<VapiLog | undefined>;
  createLog(log: InsertVapiLog): Promise<VapiLog>;
  updateLog(id: number, log: Partial<InsertVapiLog>): Promise<VapiLog>;
}

export class MemStorage implements IStorage {
  private calls: Map<number, Call>;
  private reports: Map<number, CallReport>;
  private currentCallId: number;
  private currentReportId: number;
  private logs: Map<number, VapiLog>;
  private currentId: number;

  constructor() {
    this.calls = new Map();
    this.reports = new Map();
    this.currentCallId = 1;
    this.currentReportId = 1;
    this.logs = new Map();
    this.currentId = 1;
  }

  async getCalls(): Promise<Call[]> {
    return Array.from(this.calls.values());
  }

  async getCall(id: number): Promise<Call | undefined> {
    return this.calls.get(id);
  }

  async createCall(insertCall: InsertCall): Promise<Call> {
    const id = this.currentCallId++;
    const call: Call = { ...insertCall, id };
    this.calls.set(id, call);
    return call;
  }

  async updateCall(id: number, updateData: Partial<InsertCall>): Promise<Call> {
    const existing = await this.getCall(id);
    if (!existing) {
      throw new Error(`Call with id ${id} not found`);
    }
    const updated: Call = { ...existing, ...updateData };
    this.calls.set(id, updated);
    return updated;
  }

  async createCallReport(insertReport: InsertCallReport): Promise<CallReport> {
    const id = this.currentReportId++;
    const report: CallReport = { ...insertReport, id };
    this.reports.set(id, report);
    return report;
  }

  async getLogs(): Promise<VapiLog[]> {
    return Array.from(this.logs.values());
  }

  async getLog(id: number): Promise<VapiLog | undefined> {
    return this.logs.get(id);
  }

  async createLog(insertLog: InsertVapiLog): Promise<VapiLog> {
    const id = this.currentId++;
    const log: VapiLog = { 
      ...insertLog, 
      id,
      createdAt: new Date()
    };
    this.logs.set(id, log);
    return log;
  }

  async updateLog(id: number, updateData: Partial<InsertVapiLog>): Promise<VapiLog> {
    const existing = await this.getLog(id);
    if (!existing) {
      throw new Error(`Log with id ${id} not found`);
    }
    const updated: VapiLog = { ...existing, ...updateData };
    this.logs.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();