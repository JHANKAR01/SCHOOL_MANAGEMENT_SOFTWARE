
import { NotificationService } from '../services/notification-service';

/**
 * Notification Job Interface
 */
interface NotificationJob {
  id: string;
  type: 'SMS' | 'WHATSAPP' | 'TELEGRAM' | 'PUSH';
  recipient: {
    id: string;
    token?: string; // FCM Token
    chatId?: string; // Telegram Chat ID
    phone?: string;
  };
  payload: {
    title: string;
    body: string;
    data?: any;
  };
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
}

/**
 * Sovereign Notification Queue (BullMQ Simulator)
 * Offloads bulk messaging to background workers to prevent API blocking.
 */
class NotificationQueue {
  private queue: NotificationJob[] = [];
  private isProcessing = false;

  /**
   * Add a job to the queue
   */
  async add(jobData: Omit<NotificationJob, 'id' | 'status'>) {
    const job: NotificationJob = {
      ...jobData,
      id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'PENDING'
    };
    
    this.queue.push(job);
    console.log(`[Queue] Job added: ${job.type} for ${job.recipient.id}`);
    
    // Trigger worker if idle
    if (!this.isProcessing) {
      this.processQueue();
    }
    
    return job.id;
  }

  /**
   * Worker Process
   * Pulls jobs and executes them via NotificationService
   */
  private async processQueue() {
    if (this.queue.length === 0) {
      this.isProcessing = false;
      return;
    }

    this.isProcessing = true;
    const job = this.queue.shift();

    if (job) {
      job.status = 'PROCESSING';
      try {
        // Simulate Network Delay (Latency of SMS Gateway)
        await new Promise(r => setTimeout(r, 100)); // 100ms
        
        // Execute based on Type
        if (job.type === 'PUSH' && job.recipient.token) {
          await NotificationService.sendPush({
            token: job.recipient.token,
            title: job.payload.title,
            body: job.payload.body,
            data: job.payload.data
          });
        } 
        else if (job.type === 'TELEGRAM' && job.recipient.chatId) {
             // Mock Telegram Call
             console.log(`[Worker] Sending Telegram to ${job.recipient.chatId}: ${job.payload.body}`);
        }

        job.status = 'COMPLETED';
        console.log(`[Queue] Job ${job.id} COMPLETED`);
      } catch (e) {
        job.status = 'FAILED';
        console.error(`[Queue] Job ${job.id} FAILED`, e);
        // Retry logic could go here
      }
    }

    // Recursive loop
    this.processQueue();
  }
}

// Singleton Instance
export const notificationQueue = new NotificationQueue();
