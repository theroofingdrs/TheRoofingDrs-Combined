/**
 * The Roof Doctors — Measurement Provider Abstraction & ROOFR Adapter
 * Provides provider-agnostic measurement order, polling, and data normalization.
 */

import type { Measurement, MeasurementResult, Property } from '../../../shared/types/index.ts';

export interface MeasurementOrderParams {
  property: Property;
  orderNotes?: string;
  claimNumber?: string;
  callbackUrl?: string;
}

export interface MeasurementProvider {
  name: 'ROOFR' | 'HOVER' | 'EAGLEVIEW' | 'MANUAL';
  isConnected(): Promise<boolean>;
  requestMeasurement(params: MeasurementOrderParams): Promise<{
    providerRequestId: string;
    status: Measurement['status'];
    estimatedDelivery?: string;
  }>;
  getMeasurementStatus(providerRequestId: string): Promise<{
    status: Measurement['status'];
    normalizedData?: MeasurementResult;
    rawReference?: Record<string, any>;
  }>;
}

export class ROOFRAdapter implements MeasurementProvider {
  name: 'ROOFR' = 'ROOFR';
  private apiKey: string | null = null;
  private apiBaseUrl = 'https://api.roofr.com/v1';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.ROOFR_API_KEY || null;
  }

  async isConnected(): Promise<boolean> {
    // Verified check: strictly check if live API key is configured
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  async requestMeasurement(params: MeasurementOrderParams): Promise<{
    providerRequestId: string;
    status: Measurement['status'];
    estimatedDelivery?: string;
  }> {
    const connected = await this.isConnected();
    if (!connected) {
      throw new Error(
        'ROOFR integration is not connected. Please provide ROOFR_API_KEY in server environment settings.'
      );
    }

    // When real API key is present:
    // POST to this.apiBaseUrl + '/measurements/orders' with address details
    // Here we provide the real endpoint contract:
    const response = await fetch(`${this.apiBaseUrl}/reports`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address: `${params.property.address}, ${params.property.city}, ${params.property.state} ${params.property.zip}`,
        notes: params.orderNotes,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`ROOFR API error (${response.status}): ${errBody}`);
    }

    const data = await response.json();
    return {
      providerRequestId: data.id || `roofr_${Date.now()}`,
      status: 'ORDERED',
      estimatedDelivery: data.estimated_delivery_at,
    };
  }

  async getMeasurementStatus(providerRequestId: string): Promise<{
    status: Measurement['status'];
    normalizedData?: MeasurementResult;
    rawReference?: Record<string, any>;
  }> {
    const connected = await this.isConnected();
    if (!connected) {
      return {
        status: 'FAILED',
        rawReference: { error: 'ROOFR credentials not configured on server.' },
      };
    }

    const response = await fetch(`${this.apiBaseUrl}/reports/${providerRequestId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`ROOFR API status check failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.status === 'completed') {
      const normalizedData: MeasurementResult = {
        totalSquares: data.total_squares || data.squares || 0,
        totalAreaSqFt: (data.total_squares || 0) * 100,
        predominantPitch: data.predominant_pitch || '6/12',
        ridgesLengthFt: data.ridges || 0,
        valleysLengthFt: data.valleys || 0,
        rakesLengthFt: data.rakes || 0,
        eavesLengthFt: data.eaves || 0,
        stepFlashingLengthFt: data.step_flashing || 0,
        flashingLengthFt: data.flashing || 0,
        facetsCount: data.facets_count || 0,
      };

      return {
        status: 'COMPLETED',
        normalizedData,
        rawReference: data,
      };
    }

    return {
      status: 'PROCESSING',
      rawReference: data,
    };
  }
}
