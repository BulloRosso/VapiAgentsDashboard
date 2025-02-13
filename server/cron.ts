// server/cron.ts
import cron from 'node-cron';
import axios from 'axios';
import { log } from './vite';

interface CronConfig {
  schedule: string;
  endpoint: string;
  enabled: boolean;
}

class CronService {
  private tasks: Map<string, cron.ScheduledTask>;
  private config: CronConfig;

  constructor() {
    this.tasks = new Map();
    this.config = {
      schedule: '*/2 * * * *', // Default: every 2 minutes
      endpoint: 'https://149d18b5-fe3f-4ba0-b982-a82b868464c8-00-24mbvbm32azaf.spock.replit.dev/api/vapi-call',
      enabled: true
    };
  }

  private validateCronExpression(expression: string): boolean {
    return cron.validate(expression);
  }

  public updateConfig(newConfig: Partial<CronConfig>): void {
    this.config = { ...this.config, ...newConfig };

    // Restart tasks with new configuration
    this.stopAllTasks();
    if (this.config.enabled) {
      this.startTask('apiCall', this.config.schedule);
    }

    log(`Cron configuration updated: ${JSON.stringify(this.config)}`, 'cron');
  }

  private async makeApiCall(): Promise<void> {
    try {
      const response = await axios.get(this.config.endpoint);
      log(`API call successful: ${response.status}`, 'cron');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        log(`API call failed: ${error.message}`, 'cron');
      } else {
        log(`Unexpected error during API call: ${error}`, 'cron');
      }
    }
  }

  private startTask(taskName: string, schedule: string): void {
    if (!this.validateCronExpression(schedule)) {
      throw new Error(`Invalid cron expression: ${schedule}`);
    }

    const task = cron.schedule(schedule, async () => {
      log(`Executing scheduled task: ${taskName}`, 'cron');
      await this.makeApiCall();
    });

    this.tasks.set(taskName, task);
    log(`Started cron task: ${taskName} with schedule: ${schedule}`, 'cron');
  }

  public stopTask(taskName: string): void {
    const task = this.tasks.get(taskName);
    if (task) {
      task.stop();
      this.tasks.delete(taskName);
      log(`Stopped cron task: ${taskName}`, 'cron');
    }
  }

  public stopAllTasks(): void {
    this.tasks.forEach((task, taskName) => {
      task.stop();
      this.tasks.delete(taskName);
      log(`Stopped cron task: ${taskName}`, 'cron');
    });
  }

  public initialize(): void {
    if (this.config.enabled) {
      this.startTask('apiCall', this.config.schedule);
    }
  }
}

export const cronService = new CronService();