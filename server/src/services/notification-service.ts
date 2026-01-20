
// packages/api/src/services/notification-service.ts

import 'dotenv/config';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

// Initialize Firebase Admin (Modular Singleton Pattern)
if (getApps().length === 0) {
  try {
    // Check for credentials in environment variables
    if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          // Correctly format the private key string for Node.js
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
      console.log("[FCM] Firebase Admin Driver Online (Modular)");
    } else {
      console.warn("[FCM] Credentials missing. Falling back to Simulation Driver.");
    }
  } catch (error) {
    console.error('[FCM] Driver Init Failed:', error);
  }
}

interface NotificationPayload {
  token: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}

export class NotificationService {

  static async sendPush(payload: NotificationPayload) {
    // 1. Simulation Mode (If no apps initialized)
    if (getApps().length === 0) {
      console.log(`[FCM-SIM] To: ${payload.token.slice(0, 10)}... | ${payload.title} | ${payload.body}`);
      return { success: true, simulated: true };
    }

    // 2. Production Mode
    try {
      const response = await getMessaging().send({
        token: payload.token,
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: payload.data,
      });
      return { success: true, messageId: response };
    } catch (error) {
      console.error('[FCM] Delivery Failed:', error);
      return { success: false, error };
    }
  }

  static async sendFeeReminder(studentName: string, amount: number, parentToken: string) {
    return this.sendPush({
      token: parentToken,
      title: "Fee Payment Reminder",
      body: `Dear Parent, fee of ₹${amount} for ${studentName} is due. Pay via UPI to avoid late fines.`,
      data: { type: 'FEE_REMINDER', amount: amount.toString() }
    });
  }

  static async sendAttendanceAlert(studentName: string, parentToken: string) {
    return this.sendPush({
      token: parentToken,
      title: "Absent Alert",
      body: `${studentName} has been marked ABSENT today. Please contact class teacher if this is an error.`,
      data: { type: 'ATTENDANCE_ABSENT' }
    });
  }
}