
import { AuditLog } from '../../../../types';
import { SovereignDB } from '../db';

/**
 * Sovereign Audit Logger (Immutable)
 * Records "High Stakes" actions to an append-only log.
 * Adheres to "Sovereignty Pillar 2".
 */
export class AuditLogger {
  
  /**
   * Logs a high-stakes transaction.
   * @param db - RLS-aware Prisma Client (to ensure log is tied to tenant)
   * @param action - Type of action
   * @param actor - Who performed it
   * @param details - Human readable description
   * @param entity - What was modified
   * @param oldData - JSON Snapshot before change
   * @param newData - JSON Snapshot after change
   */
  static async log(
    db: any,
    action: AuditLog['action'], 
    actor: { id: string, school_id: string },
    details: string,
    entity: AuditLog['entity'],
    entityId?: string,
    oldData?: any,
    newData?: any
  ) {
    // 1. IP Hashing (Privacy Preserving)
    const ipHash = "a1b2c3d4"; // Mock. In prod: hash(req.ip + salt)

    const logEntry: AuditLog = {
      id: crypto.randomUUID(),
      school_id: actor.school_id,
      timestamp: new Date().toISOString(),
      action,
      entity,
      entity_id: entityId,
      actor_id: actor.id,
      details,
      ip_hash: ipHash,
      old_data: oldData,
      new_data: newData
    };

    // 2. Dev Output
    console.log(`[AUDIT] [${logEntry.action}] ${details} | Diff: ${JSON.stringify(oldData)} -> ${JSON.stringify(newData)}`);

    // 3. Immutable Write
    // Note: The 'auditLog' table should have a DB Trigger preventing updates/deletes.
    try {
        await db.auditLog.create({ data: logEntry });
    } catch(e) {
        console.error("CRITICAL: AUDIT LOG FAILED. Transaction should rollback.", e);
        throw new Error("Audit Log Failure"); // Force transaction rollback
    }
    
    return logEntry;
  }
}
