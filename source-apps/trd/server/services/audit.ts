/**
 * The Roof Doctors — Protected Audit Log Infrastructure
 * Provides append-only, tamper-resistant system activity and security tracking.
 */

import { getDatabase, persistDatabase, generateId } from '../db/database.ts';
import type { AuditLog } from '../../shared/types/index.ts';

export interface RecordAuditParams {
  userId?: string;
  userRole?: string;
  action: AuditLog['action'];
  entityType: string;
  entityId: string;
  previousState?: Record<string, any>;
  newState?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export function logAuditAction(params: RecordAuditParams): AuditLog {
  const db = getDatabase();
  const entry: AuditLog = {
    id: generateId('audit'),
    userId: params.userId || 'system',
    userRole: params.userRole || 'SYSTEM',
    action: params.action,
    entityType: params.entityType,
    entityId: params.entityId,
    previousState: params.previousState,
    newState: params.newState,
    ipAddress: params.ipAddress || 'internal',
    userAgent: params.userAgent || 'system-agent',
    timestamp: new Date().toISOString(),
  };

  db.auditLogs.unshift(entry); // Most recent first
  persistDatabase();
  return entry;
}

export function getAuditLogs(filters?: { entityType?: string; entityId?: string; limit?: number }): AuditLog[] {
  const db = getDatabase();
  let logs = db.auditLogs;

  if (filters?.entityType) {
    logs = logs.filter((l) => l.entityType === filters.entityType);
  }
  if (filters?.entityId) {
    logs = logs.filter((l) => l.entityId === filters.entityId);
  }
  if (filters?.limit) {
    logs = logs.slice(0, filters.limit);
  }

  return logs;
}
