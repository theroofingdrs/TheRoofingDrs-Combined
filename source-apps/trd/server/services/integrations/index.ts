/**
 * The Roof Doctors — Integration Hub
 * Central registry of third-party adapters with strict zero-fake-connection rules.
 */

import { ROOFRAdapter } from './roofr.ts';
import type { Integration, IntegrationProvider } from '../../../shared/types/index.ts';
import { getDatabase, persistDatabase } from '../../db/database.ts';

export interface IntegrationAdapterInfo {
  provider: IntegrationProvider;
  category: Integration['category'];
  name: string;
  description: string;
  requiredEnvVars: string[];
  docsUrl: string;
}

export const SUPPORTED_INTEGRATIONS: IntegrationAdapterInfo[] = [
  {
    provider: 'ROOFR',
    category: 'MEASUREMENTS',
    name: 'ROOFR Aerial Measurements',
    description: 'High-precision satellite aerial roof measurement reports and instant material take-offs.',
    requiredEnvVars: ['ROOFR_API_KEY'],
    docsUrl: 'https://docs.roofr.com',
  },
  {
    provider: 'STRIPE',
    category: 'PAYMENTS',
    name: 'Stripe Payment Processing',
    description: 'Secure credit card, ACH, and financing milestone deposits.',
    requiredEnvVars: ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET'],
    docsUrl: 'https://stripe.com/docs',
  },
  {
    provider: 'TWILIO',
    category: 'COMMUNICATION',
    name: 'Twilio SMS & Voice',
    description: 'Transactional SMS inspection confirmations and storm emergency notifications.',
    requiredEnvVars: ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_PHONE_NUMBER'],
    docsUrl: 'https://www.twilio.com/docs',
  },
  {
    provider: 'RESEND',
    category: 'COMMUNICATION',
    name: 'Resend Transactional Email',
    description: 'Inspection reports, proposals, and warranty certificates delivered via email.',
    requiredEnvVars: ['RESEND_API_KEY'],
    docsUrl: 'https://resend.com/docs',
  },
  {
    provider: 'GOOGLE_CALENDAR',
    category: 'CALENDAR',
    name: 'Google Calendar Two-Way Sync',
    description: 'Inspector schedule synchronization and automatic appointment booking.',
    requiredEnvVars: ['GOOGLE_CALENDAR_CLIENT_ID', 'GOOGLE_CALENDAR_CLIENT_SECRET'],
    docsUrl: 'https://developers.google.com/calendar',
  },
];

export const FUTURE_PROVIDER_INTERFACES: string[] = [
  'HOVER',
  'EAGLEVIEW',
  'XACTIMATE_WORKFLOW',
  'ACCULYNX',
  'JOBNIMBUS',
  'GOHIGHLEVEL',
  'HUBSPOT',
  'QUICKBOOKS',
  'XERO',
  'META',
  'GOOGLE_ADS',
  'MICROSOFT_ADS',
];

export function getActiveAdapter(provider: IntegrationProvider) {
  switch (provider) {
    case 'ROOFR':
      return new ROOFRAdapter();
    default:
      return null;
  }
}

export function syncIntegrationStatus(): Integration[] {
  const db = getDatabase();

  for (const info of SUPPORTED_INTEGRATIONS) {
    let integration = db.integrations.find((i) => i.provider === info.provider);
    if (!integration) {
      continue;
    }

    // Check if required environment variables are present on server
    const allConfigured = info.requiredEnvVars.every((v) => Boolean(process.env[v] && process.env[v]!.trim().length > 0));

    integration.status = allConfigured ? 'CONNECTED' : 'NOT_CONNECTED';
    integration.enabled = allConfigured;
    integration.configurationMetadata = {
      ...integration.configurationMetadata,
      checkedAt: new Date().toISOString(),
      missingEnvVars: info.requiredEnvVars.filter((v) => !process.env[v]),
    };
  }

  persistDatabase();
  return db.integrations;
}
