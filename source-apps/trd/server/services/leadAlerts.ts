/**
 * The Roof Doctors — Outbound Lead Notification Service
 * Dispatches real-time Email (Resend) and SMS (Twilio) alerts when new leads are created.
 * Failure-isolated: Outbound communication failures never prevent CRM lead persistence.
 */

import type { Lead } from '../../shared/types/index.ts';
import { getDatabase, persistDatabase, generateId } from '../db/database.ts';

export interface AlertDispatchResult {
  email: {
    attempted: boolean;
    sent: boolean;
    provider: 'RESEND' | 'STAGED';
    recipient: string;
    id?: string;
    message?: string;
  };
  sms: {
    attempted: boolean;
    sent: boolean;
    provider: 'TWILIO' | 'STAGED';
    recipient: string;
    sid?: string;
    message?: string;
  };
}

const PRIMARY_EMAIL_RECIPIENT = 'TheRoofingDrs@gmail.com';
const PRIMARY_SMS_RECIPIENT = '903-231-5940';
const PRIMARY_SMS_E164 = '+19032315940';

/**
 * Format full address from lead fields
 */
function formatFullAddress(lead: Lead): string {
  const parts = [lead.address];
  if (lead.city) parts.push(lead.city);
  if (lead.state) parts.push(lead.state);
  if (lead.zip) parts.push(lead.zip);
  return parts.filter(Boolean).join(', ') || 'Address not specified';
}

/**
 * Get the public/app base URL for direct CRM links
 */
function getAppBaseUrl(): string {
  const envUrl = process.env.APP_URL;
  if (envUrl && envUrl.trim() && !envUrl.includes('MY_APP_URL')) {
    return envUrl.replace(/\/+$/, '');
  }
  return 'https://ais-dev-sfn24dys3rqbpyhlerhi2d-405254021242.us-east1.run.app';
}

/**
 * Build email subject according to user specification:
 * NEW ROOF LEAD — [Full Name] — [City]
 */
function buildEmailSubject(lead: Lead): string {
  const city = lead.city?.trim() || 'Texarkana';
  const division = String((lead as any).division || 'RESIDENTIAL').toUpperCase() === 'COMMERCIAL' ? 'COMMERCIAL' : 'RESIDENTIAL';
  return `${division} ROOF LEAD — ${lead.name} — ${city}`;
}

/**
 * Build HTML and Plain Text email payloads
 */
function buildEmailBody(lead: Lead, crmLeadUrl: string): { html: string; text: string } {
  const fullAddress = formatFullAddress(lead);
  const emergencyBadge = lead.emergencyFlag
    ? '🚨 YES — IMMEDIATE EMERGENCY / ACTIVE ROOF BREACH'
    : 'No';
  const stormBadge = lead.stormRelatedFlag
    ? '⚡ YES — Storm / Wind / Hail Event Damage'
    : 'No';
  const insuranceBadge = lead.insuranceRelatedFlag
    ? '📋 YES — Insurance Claim Restoration Inquired'
    : 'No';
  const scoreReasons = (lead.scoreReasons || []).join(' • ') || 'Standard intake';

  const text = `
========================================
THE ROOF DOCTORS — NEW LEAD NOTIFICATION
========================================

LEAD INFORMATION:
- Full Name: ${lead.name}
- Phone: ${lead.phone}
- Email: ${lead.email || 'None provided'}
- Street Address: ${lead.address || 'None provided'}
- City: ${lead.city || 'Texarkana'}
- State: ${lead.state || 'TX'}
- ZIP: ${lead.zip || 'None provided'}
- Full Address: ${fullAddress}
- Service Requested: ${lead.serviceRequested || 'Diagnostic Inspection'}

STATUS & QUALIFICATIONS:
- Lead Type: ${lead.leadType || 'NOT_SURE'}
- Emergency Status: ${emergencyBadge}
- Storm Damage: ${stormBadge}
- Insurance Claim: ${insuranceBadge}
- Preferred Contact Method: ${lead.preferredContactMethod || 'PHONE'}
- Priority Score: ${lead.score} / 100 (${scoreReasons})
- Attribution / Source: ${lead.source || 'Direct'}

CUSTOMER MESSAGE / NOTES:
"${lead.message || 'No additional project notes provided by customer.'}"

DIRECT CRM RECORD LINK:
${crmLeadUrl}

========================================
The Roof Doctors • Emergency Dispatch: 903-231-5940 | TheRoofingDrs@gmail.com
Texarkana HQ: 500 E Front St, Texarkana, TX 75501
`.trim();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Roof Doctors Lead</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #0f172a;">
  <div style="max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
    
    <!-- Header -->
    <div style="background-color: ${lead.emergencyFlag ? '#991b1b' : '#0f172a'}; padding: 20px 24px; text-align: left;">
      <div style="color: #ffffff; font-size: 18px; font-weight: 800; letter-spacing: -0.02em;">
        ${lead.emergencyFlag ? '🚨 EMERGENCY DISPATCH ALERT' : 'THE ROOF DOCTORS — NEW LEAD'}
      </div>
      <div style="color: ${lead.emergencyFlag ? '#fecaca' : '#94a3b8'}; font-size: 12px; margin-top: 4px;">
        Texarkana & Northeast Texas Residential Roofing Hub
      </div>
    </div>

    <!-- Alert Highlight Banner -->
    ${
      lead.emergencyFlag
        ? `<div style="background-color: #fee2e2; border-bottom: 2px solid #ef4444; padding: 12px 24px; color: #991b1b; font-weight: 700; font-size: 13px;">
            ⚠️ IMMEDIATE ACTION REQUIRED: Customer flagged active roof breach / emergency water intrusion.
           </div>`
        : ''
    }

    <!-- Content -->
    <div style="padding: 24px;">
      
      <!-- Primary Contact Card -->
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
        <div style="font-size: 20px; font-weight: 800; color: #0f172a; margin-bottom: 8px;">
          ${lead.name}
        </div>
        <div style="font-size: 14px; color: #334155; margin-bottom: 6px;">
          📞 <strong>Phone:</strong> <a href="tel:${lead.phone}" style="color: #dc2626; font-weight: 700; text-decoration: none;">${lead.phone}</a>
        </div>
        <div style="font-size: 14px; color: #334155; margin-bottom: 6px;">
          ✉️ <strong>Email:</strong> ${
            lead.email
              ? `<a href="mailto:${lead.email}" style="color: #2563eb; text-decoration: none;">${lead.email}</a>`
              : '<span style="color: #64748b;">Not provided</span>'
          }
        </div>
        <div style="font-size: 14px; color: #334155;">
          📍 <strong>Address:</strong> ${fullAddress}
        </div>
      </div>

      <!-- Detailed Fields Table -->
      <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 8px 0; color: #64748b; width: 38%;">Full Name:</td>
          <td style="padding: 8px 0; font-weight: 700; color: #0f172a;">${lead.name}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 8px 0; color: #64748b;">Phone:</td>
          <td style="padding: 8px 0; font-weight: 700; color: #dc2626;">${lead.phone}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 8px 0; color: #64748b;">Email:</td>
          <td style="padding: 8px 0; color: #0f172a;">${lead.email || 'None provided'}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 8px 0; color: #64748b;">Street Address:</td>
          <td style="padding: 8px 0; color: #0f172a;">${lead.address || 'None provided'}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 8px 0; color: #64748b;">City:</td>
          <td style="padding: 8px 0; font-weight: 600; color: #0f172a;">${lead.city || 'Texarkana'}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 8px 0; color: #64748b;">State:</td>
          <td style="padding: 8px 0; color: #0f172a;">${lead.state || 'TX'}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 8px 0; color: #64748b;">ZIP Code:</td>
          <td style="padding: 8px 0; color: #0f172a;">${lead.zip || 'None provided'}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 8px 0; color: #64748b;">Service Requested:</td>
          <td style="padding: 8px 0; font-weight: 700; color: #0f172a;">${lead.serviceRequested || 'Diagnostic Roof Inspection'}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 8px 0; color: #64748b;">Lead Type:</td>
          <td style="padding: 8px 0; color: #0f172a;">${lead.leadType || 'NOT_SURE'}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 8px 0; color: #64748b;">Emergency Status:</td>
          <td style="padding: 8px 0; font-weight: 700; color: ${lead.emergencyFlag ? '#dc2626' : '#10b981'};">
            ${emergencyBadge}
          </td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 8px 0; color: #64748b;">Storm / Wind / Hail:</td>
          <td style="padding: 8px 0; font-weight: 600; color: #0f172a;">${stormBadge}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 8px 0; color: #64748b;">Insurance Related:</td>
          <td style="padding: 8px 0; font-weight: 600; color: #0f172a;">${insuranceBadge}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 8px 0; color: #64748b;">Preferred Contact:</td>
          <td style="padding: 8px 0; font-weight: 600; color: #0f172a;">${lead.preferredContactMethod || 'PHONE'}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 8px 0; color: #64748b;">Lead Priority Score:</td>
          <td style="padding: 8px 0; font-weight: 700; color: #dc2626;">${lead.score} / 100 <span style="font-size: 11px; font-weight: normal; color: #64748b;">(${scoreReasons})</span></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b;">Attribution Source:</td>
          <td style="padding: 8px 0; font-weight: 600; color: #0f172a;">${lead.source || 'Direct'}</td>
        </tr>
      </table>

      <!-- Customer Message -->
      <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 14px; margin-bottom: 24px;">
        <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #92400e; margin-bottom: 4px;">
          Customer Notes / Roof Symptoms:
        </div>
        <div style="font-size: 13px; color: #78350f; font-style: italic;">
          "${lead.message || 'No additional symptoms specified in intake form.'}"
        </div>
      </div>

      <!-- CRM Action Button -->
      <div style="text-align: center; margin: 28px 0 12px 0;">
        <a href="${crmLeadUrl}" style="display: inline-block; background-color: #dc2626; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 700; font-size: 14px; box-shadow: 0 2px 4px rgba(220,38,38,0.2);">
          Open Lead Record in CRM &rarr;
        </a>
      </div>
      <div style="text-align: center; font-size: 11px; color: #94a3b8;">
        Direct link: <a href="${crmLeadUrl}" style="color: #64748b;">${crmLeadUrl}</a>
      </div>

    </div>

    <!-- Footer -->
    <div style="background-color: #f1f5f9; padding: 16px 24px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; text-align: center;">
      The Roof Doctors • 500 E Front St, Texarkana, TX 75501 • Emergency Dispatch: 903-231-5940<br>
      Licensed &amp; Insured Residential Roofing Specialists • Serving Bowie, Cass, Red River &amp; Surrounding Counties
    </div>

  </div>
</body>
</html>
`.trim();

  return { html, text };
}

/**
 * Build concise SMS body
 */
function buildSmsBody(lead: Lead, crmLeadUrl: string): string {
  const statusBadge = lead.emergencyFlag
    ? 'EMERGENCY'
    : lead.score >= 50
    ? 'HIGH PRIORITY'
    : 'Standard';

  const prefix = lead.emergencyFlag ? '🚨 [URGENT ROOF DOCTORS]' : '[ROOF DOCTORS LEAD]';

  return `${prefix}
Name: ${lead.name}
Phone: ${lead.phone}
Service: ${lead.serviceRequested || 'Diagnostic Roof Inspection'}
City: ${lead.city || 'Texarkana Area'}
Status: ${statusBadge} (Score: ${lead.score})
CRM: ${crmLeadUrl}`.trim();
}

/**
 * Dispatch Email Alert via Resend (or staged fallback if credentials unconfigured)
 */
async function dispatchEmailAlert(
  lead: Lead,
  crmLeadUrl: string
): Promise<AlertDispatchResult['email']> {
  const subject = buildEmailSubject(lead);
  const { html, text } = buildEmailBody(lead, crmLeadUrl);
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey || apiKey.trim().length === 0) {
    const msg = `RESEND_API_KEY environment variable is not configured. Email alert staged for ${PRIMARY_EMAIL_RECIPIENT}. Subject: "${subject}"`;
    console.warn(`[LeadAlerts:Email] ⚠️  ${msg}`);
    return {
      attempted: false,
      sent: false,
      provider: 'STAGED',
      recipient: PRIMARY_EMAIL_RECIPIENT,
      message: msg,
    };
  }

  try {
    const fromAddress =
      process.env.RESEND_FROM_EMAIL ||
      'The Roof Doctors <notifications@theroofingdrs.com>';

    console.log(
      `[LeadAlerts:Email] Sending Resend email to ${PRIMARY_EMAIL_RECIPIENT} from ${fromAddress}...`
    );

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [PRIMARY_EMAIL_RECIPIENT],
        subject,
        html,
        text,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = `Resend API returned status ${response.status}: ${JSON.stringify(data)}`;
      console.error(`[LeadAlerts:Email] ❌ ${errorMsg}`);
      return {
        attempted: true,
        sent: false,
        provider: 'RESEND',
        recipient: PRIMARY_EMAIL_RECIPIENT,
        message: errorMsg,
      };
    }

    console.log(
      `[LeadAlerts:Email] ✅ Successfully dispatched email to ${PRIMARY_EMAIL_RECIPIENT} (Resend ID: ${data.id})`
    );
    return {
      attempted: true,
      sent: true,
      provider: 'RESEND',
      recipient: PRIMARY_EMAIL_RECIPIENT,
      id: data.id,
      message: 'Email delivered to Resend queue',
    };
  } catch (err: any) {
    const errorMsg = `Network or unexpected error while dispatching email via Resend: ${err?.message || err}`;
    console.error(`[LeadAlerts:Email] ❌ ${errorMsg}`);
    return {
      attempted: true,
      sent: false,
      provider: 'RESEND',
      recipient: PRIMARY_EMAIL_RECIPIENT,
      message: errorMsg,
    };
  }
}

/**
 * Dispatch SMS Alert via Twilio (or staged fallback if credentials unconfigured)
 */
async function dispatchSmsAlert(
  lead: Lead,
  crmLeadUrl: string
): Promise<AlertDispatchResult['sms']> {
  const smsBody = buildSmsBody(lead, crmLeadUrl);
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  const missingVars: string[] = [];
  if (!accountSid) missingVars.push('TWILIO_ACCOUNT_SID');
  if (!authToken) missingVars.push('TWILIO_AUTH_TOKEN');
  if (!fromNumber) missingVars.push('TWILIO_PHONE_NUMBER');

  if (missingVars.length > 0) {
    const msg = `Twilio credentials missing (${missingVars.join(', ')}). SMS alert staged for ${PRIMARY_SMS_RECIPIENT}. Body: "${smsBody.replace(/\n/g, ' ')}"`;
    console.warn(`[LeadAlerts:SMS] ⚠️  ${msg}`);
    return {
      attempted: false,
      sent: false,
      provider: 'STAGED',
      recipient: PRIMARY_SMS_RECIPIENT,
      message: msg,
    };
  }

  try {
    const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const basicAuth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

    const formParams = new URLSearchParams();
    formParams.append('To', PRIMARY_SMS_E164);
    formParams.append('From', fromNumber!.trim());
    formParams.append('Body', smsBody);

    console.log(
      `[LeadAlerts:SMS] Sending Twilio SMS to ${PRIMARY_SMS_E164} from ${fromNumber}...`
    );

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formParams.toString(),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = `Twilio API returned status ${response.status}: ${JSON.stringify(data)}`;
      console.error(`[LeadAlerts:SMS] ❌ ${errorMsg}`);
      return {
        attempted: true,
        sent: false,
        provider: 'TWILIO',
        recipient: PRIMARY_SMS_RECIPIENT,
        message: errorMsg,
      };
    }

    console.log(
      `[LeadAlerts:SMS] ✅ Successfully dispatched SMS to ${PRIMARY_SMS_RECIPIENT} (Twilio SID: ${data.sid})`
    );
    return {
      attempted: true,
      sent: true,
      provider: 'TWILIO',
      recipient: PRIMARY_SMS_RECIPIENT,
      sid: data.sid,
      message: 'SMS delivered to Twilio queue',
    };
  } catch (err: any) {
    const errorMsg = `Network or unexpected error while dispatching SMS via Twilio: ${err?.message || err}`;
    console.error(`[LeadAlerts:SMS] ❌ ${errorMsg}`);
    return {
      attempted: true,
      sent: false,
      provider: 'TWILIO',
      recipient: PRIMARY_SMS_RECIPIENT,
      message: errorMsg,
    };
  }
}

/**
 * Build Homeowner Confirmation Email payload
 */
function buildCustomerConfirmationBody(lead: Lead): { html: string; text: string } {
  const fullAddress = formatFullAddress(lead);
  const text = `
========================================
THE ROOF DOCTORS — DIAGNOSTIC INTAKE CONFIRMATION
========================================

Hello ${lead.name},

Thank you for contacting The Roof Doctors! We have received your diagnostic inspection request.

PROJECT SUMMARY:
- Service Requested: ${lead.serviceRequested || 'Diagnostic Roof Inspection'}
- Property Location: ${fullAddress}
- Contact Phone: ${lead.phone}
- Preferred Contact: ${lead.preferredContactMethod || 'PHONE'}
${lead.message ? `- Symptoms / Notes: "${lead.message}"` : ''}

WHAT HAPPENS NEXT:
1. Evaluation Scheduling: Our local Texarkana dispatch will reach out to you at ${lead.phone} to confirm your diagnostic inspection time.
2. The 21-Point Walk: Our certified inspector conducts a complete physical assessment of shingles, pipe boots, valleys, flashings, and attic decking.
3. Digital Report: You will receive high-resolution photo documentation and an itemized breakdown with zero pressure.

NEED IMMEDIATE EMERGENCY RESPONSE?
If you have an active leak requiring emergency tarping, call our 24/7 emergency dispatch directly at 903-231-5940.

========================================
The Roof Doctors
500 E Front St, Texarkana, TX 75501
Direct Phone: 903-231-5940 | TheRoofingDrs@gmail.com
`.trim();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Diagnostic Inspection Request Confirmed</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #0f172a;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
    
    <!-- Header -->
    <div style="background-color: #0f172a; padding: 24px; text-align: left; border-bottom: 3px solid #dc2626;">
      <div style="color: #dc2626; font-size: 11px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase;">
        THE ROOF DOCTORS • TEXARKANA, TX
      </div>
      <div style="color: #ffffff; font-size: 20px; font-weight: 800; margin-top: 4px;">
        Diagnostic Inspection Request Received
      </div>
    </div>

    <!-- Content -->
    <div style="padding: 24px;">
      <p style="font-size: 15px; line-height: 1.5; color: #334155; margin-top: 0;">
        Hello <strong>${lead.name}</strong>,
      </p>
      <p style="font-size: 14px; line-height: 1.5; color: #475569;">
        Thank you for trusting The Roof Doctors. We have logged your diagnostic evaluation request in our dispatch queue.
      </p>

      <!-- Details Card -->
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin: 20px 0;">
        <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em; margin-bottom: 10px;">
          Inspection Scope Details
        </div>
        <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 6px 0; color: #64748b; width: 35%;">Service:</td>
            <td style="padding: 6px 0; font-weight: 700; color: #0f172a;">${lead.serviceRequested || 'Diagnostic Inspection'}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 6px 0; color: #64748b;">Property:</td>
            <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${fullAddress}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 6px 0; color: #64748b;">Contact Phone:</td>
            <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${lead.phone}</td>
          </tr>
          ${
            lead.message
              ? `<tr>
                  <td style="padding: 6px 0; color: #64748b; vertical-align: top;">Notes:</td>
                  <td style="padding: 6px 0; color: #334155; font-style: italic;">"${lead.message}"</td>
                </tr>`
              : ''
          }
        </table>
      </div>

      <!-- What happens next -->
      <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
        <div style="font-size: 13px; font-weight: 700; color: #166534; margin-bottom: 8px;">
          What to expect next:
        </div>
        <ol style="margin: 0; padding-left: 20px; font-size: 13px; color: #15803d; line-height: 1.6;">
          <li>Our Texarkana inspection dispatch will contact you at <strong>${lead.phone}</strong> to confirm your arrival window.</li>
          <li>A certified roofing specialist walks your entire roof surface, testing granular adhesion, chimney flashing, valleys, and attic moisture rot.</li>
          <li>You receive an itemized diagnostic condition report with high-res photos and transparent guidance.</li>
        </ol>
      </div>

      <!-- Emergency Contact Banner -->
      <div style="background-color: #fff1f2; border: 1px solid #fecdd3; border-radius: 8px; padding: 14px; text-align: center;">
        <div style="font-size: 13px; font-weight: 700; color: #9f1239;">
          Need immediate leak mitigation or emergency tarping?
        </div>
        <div style="font-size: 15px; font-weight: 800; color: #e11d48; margin-top: 4px;">
          📞 Call Dispatch 24/7: <a href="tel:903-231-5940" style="color: #e11d48; text-decoration: none;">903-231-5940</a>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #f1f5f9; padding: 16px 24px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; text-align: center;">
      <strong>The Roof Doctors</strong> • 500 E Front St, Texarkana, TX 75501<br>
      Licensed &amp; Insured Residential Roofing Specialists • Serving Bowie, Cass, Red River &amp; Surrounding Counties
    </div>

  </div>
</body>
</html>
`.trim();

  return { html, text };
}

/**
 * Dispatch Homeowner Confirmation Email via Resend
 */
async function dispatchCustomerConfirmationEmail(
  lead: Lead
): Promise<{ attempted: boolean; sent: boolean; message?: string }> {
  if (!lead.email || !lead.email.includes('@')) {
    return { attempted: false, sent: false, message: 'No valid customer email' };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.trim().length === 0) {
    return { attempted: false, sent: false, message: 'RESEND_API_KEY not configured' };
  }

  const subject = `Your Roof Diagnostic Request Has Been Received — The Roof Doctors`;
  const { html, text } = buildCustomerConfirmationBody(lead);
  const fromAddress =
    process.env.RESEND_FROM_EMAIL ||
    'The Roof Doctors <notifications@theroofingdrs.com>';

  try {
    console.log(`[LeadAlerts:CustomerEmail] Sending confirmation to ${lead.email}...`);
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [lead.email.trim()],
        subject,
        html,
        text,
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const err = `Resend API returned status ${response.status}: ${JSON.stringify(data)}`;
      console.error(`[LeadAlerts:CustomerEmail] ❌ ${err}`);
      return { attempted: true, sent: false, message: err };
    }

    console.log(`[LeadAlerts:CustomerEmail] ✅ Dispatched confirmation to ${lead.email} (Resend ID: ${data.id})`);
    return { attempted: true, sent: true, message: `Dispatched (ID: ${data.id})` };
  } catch (err: any) {
    const errStr = `Error dispatching customer confirmation: ${err?.message || err}`;
    console.error(`[LeadAlerts:CustomerEmail] ❌ ${errStr}`);
    return { attempted: true, sent: false, message: errStr };
  }
}

/**
 * Main entry point: Evaluates and dispatches outbound alerts for new leads.
 * Failure-isolated: Cannot throw or interrupt caller.
 */
export async function dispatchNewLeadOutboundAlerts(lead: Lead): Promise<AlertDispatchResult> {
  const crmLeadUrl = `${getAppBaseUrl()}/app/leads/${lead.id}`;

  console.log(`[LeadAlerts] 🔔 Triggering outbound lead alerts for Lead #${lead.id} (${lead.name})...`);

  // Dispatch email alert via Resend (Twilio SMS is not active yet per instructions)
  const emailResult = await dispatchEmailAlert(lead, crmLeadUrl).catch((err) => ({
    attempted: true,
    sent: false,
    provider: 'RESEND' as const,
    recipient: PRIMARY_EMAIL_RECIPIENT,
    message: `Fatal catch: ${err?.message || err}`,
  }));

  // Also dispatch homeowner confirmation if customer provided their email address
  const customerEmailResult = await dispatchCustomerConfirmationEmail(lead).catch((err) => ({
    attempted: true,
    sent: false,
    message: `Fatal catch: ${err?.message || err}`,
  }));

  const smsResult: AlertDispatchResult['sms'] = {
    attempted: false,
    sent: false,
    provider: 'STAGED',
    recipient: PRIMARY_SMS_RECIPIENT,
    message: 'SMS alert deferred (Twilio not configured)',
  };

  // Safely record outbound communication attempt on the lead's activity timeline
  try {
    const db = getDatabase();
    const emailStatusStr = emailResult.sent
      ? 'Sent via Resend'
      : emailResult.attempted
      ? `Failed (${emailResult.message})`
      : 'Staged (RESEND_API_KEY required)';

    const customerEmailStr = customerEmailResult.sent
      ? `Customer Confirmation -> ${lead.email} [Sent]`
      : customerEmailResult.attempted
      ? `Customer Confirmation -> ${lead.email} [Failed]`
      : '';

    const summaryParts = [`Outbound Notifications: Lead Alert -> ${PRIMARY_EMAIL_RECIPIENT} [${emailStatusStr}]`];
    if (customerEmailStr) {
      summaryParts.push(customerEmailStr);
    }

    db.leadActivities.unshift({
      id: generateId('lact'),
      leadId: lead.id,
      activityType: 'NOTE_ADDED',
      description: summaryParts.join(' | '),
      createdAt: new Date().toISOString(),
    });
    persistDatabase();
  } catch (recordErr) {
    console.error('[LeadAlerts] Non-blocking warning: Failed to record activity timeline entry:', recordErr);
  }

  return { email: emailResult, sms: smsResult };
}
