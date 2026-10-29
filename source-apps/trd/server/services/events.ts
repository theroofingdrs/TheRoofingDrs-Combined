/**
 * The Roof Doctors — System Event Bus
 * Dispatches domain events across the platform to decouple subsystems and feed automation.
 */

import { getDatabase, persistDatabase, generateId } from '../db/database.ts';
import { logAuditAction } from './audit.ts';
import { dispatchNewLeadOutboundAlerts } from './leadAlerts.ts';

export type SystemEventType =
  | 'LEAD_CREATED'
  | 'LEAD_UPDATED'
  | 'APPOINTMENT_CREATED'
  | 'APPOINTMENT_REMINDER'
  | 'INSPECTION_COMPLETED'
  | 'MEASUREMENT_REQUESTED'
  | 'MEASUREMENT_COMPLETED'
  | 'ESTIMATE_CREATED'
  | 'ESTIMATE_UPDATED'
  | 'ESTIMATE_APPROVED'
  | 'ESTIMATE_REVISED'
  | 'ESTIMATE_SENT'
  | 'PROPOSAL_CREATED'
  | 'PROPOSAL_APPROVED'
  | 'PROPOSAL_SENT'
  | 'PROPOSAL_VIEWED'
  | 'PROPOSAL_OPTION_SELECTED'
  | 'PROPOSAL_CHANGE_REQUESTED'
  | 'PROPOSAL_ACCEPTED'
  | 'PROPOSAL_DECLINED'
  | 'PROPOSAL_EXPIRED'
  | 'SALE_CREATED'
  | 'SALE_UPDATED'
  | 'PAYMENT_REQUESTED'
  | 'PAYMENT_RECEIVED'
  | 'PROJECT_STARTED'
  | 'PROJECT_COMPLETED'
  | 'MAINTENANCE_DUE'
  | 'MISSED_CALL'
  | 'STORM_EVENT_CREATED'
  | 'PHOTO_ANALYSIS_COMPLETED'
  | 'DOCUMENT_UPLOADED'
  | 'REVIEW_REQUESTED'
  | 'INVOICE_ISSUED'
  | 'DEDUCTIBLE_VERIFIED'
  | 'PROJECT_SCHEDULED'
  | 'PRODUCTION_STARTED'
  | 'PO_ORDERED'
  | 'PO_DELIVERED';

export interface SystemEventPayload {
  type: SystemEventType;
  entityType: string;
  entityId: string;
  data: Record<string, any>;
  userId?: string;
}

type EventHandler = (event: SystemEventPayload) => Promise<void> | void;

const listeners: Map<SystemEventType, EventHandler[]> = new Map();

export function onSystemEvent(type: SystemEventType, handler: EventHandler) {
  const list = listeners.get(type) || [];
  list.push(handler);
  listeners.set(type, list);
}

export async function emitSystemEvent(payload: SystemEventPayload) {
  console.log(`[EventBus] ${payload.type} -> ${payload.entityType}:${payload.entityId}`);

  // Create notifications or audit traces as appropriate
  const db = getDatabase();

  if (payload.type === 'LEAD_CREATED') {
    db.notifications.unshift({
      id: generateId('notif'),
      priority: payload.data.emergencyFlag ? 'EMERGENCY' : 'HIGH',
      type: 'LEAD_ALERT',
      title: payload.data.emergencyFlag ? 'URGENT: Emergency Roof Breach Lead' : 'New Roof Diagnostic Lead',
      message: `${payload.data.name} in ${payload.data.city || 'local area'} requested diagnostic review.`,
      relatedEntityType: 'Lead',
      relatedEntityId: payload.entityId,
      actionUrl: `/app/leads/${payload.entityId}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    });
    persistDatabase();

    // Trigger outbound Email (TheRoofingDrs@gmail.com) alerts via Resend
    await dispatchNewLeadOutboundAlerts(payload.data as any).catch((err) => {
      console.error('[EventBus] Error dispatching outbound lead alerts:', err);
    });
  } else if (payload.type === 'PROPOSAL_ACCEPTED') {
    db.notifications.unshift({
      id: generateId('notif'),
      priority: 'HIGH',
      type: 'SYSTEM',
      title: `Contract Signed: Proposal #${payload.data.proposalNumber || payload.entityId}`,
      message: `${payload.data.signerName || 'Homeowner'} digitally signed proposal for $${Number(payload.data.amount || 0).toLocaleString()} (${payload.data.selectedOptionName || 'Selected Option'}). Job marked SOLD!`,
      relatedEntityType: 'Proposal',
      relatedEntityId: payload.entityId,
      actionUrl: `/app/proposals/${payload.entityId}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    });
    persistDatabase();
  } else if (payload.type === 'PROPOSAL_CHANGE_REQUESTED') {
    db.notifications.unshift({
      id: generateId('notif'),
      priority: 'HIGH',
      type: 'SYSTEM',
      title: `Revision Requested: Proposal #${payload.data.proposalNumber || payload.entityId}`,
      message: `Customer inquired/requested changes: "${payload.data.notes || 'Revisions requested'}".`,
      relatedEntityType: 'Proposal',
      relatedEntityId: payload.entityId,
      actionUrl: `/app/proposals/${payload.entityId}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    });
    persistDatabase();
  } else if (payload.type === 'ESTIMATE_CREATED') {
    db.notifications.unshift({
      id: generateId('notif'),
      priority: 'MEDIUM',
      type: 'SYSTEM',
      title: `New Estimate Generated: ${payload.data.estimateNumber || payload.entityId}`,
      message: `Estimate created for $${Number(payload.data.total || 0).toLocaleString()} (${payload.data.title || 'Roof Scope'}).`,
      relatedEntityType: 'Estimate',
      relatedEntityId: payload.entityId,
      actionUrl: `/app/estimates/${payload.entityId}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    });
    persistDatabase();
  }

  // Notify registered listeners
  const handlers = listeners.get(payload.type) || [];
  for (const handler of handlers) {
    try {
      await handler(payload);
    } catch (err) {
      console.error(`[EventBus] Handler error for ${payload.type}:`, err);
    }
  }
}
