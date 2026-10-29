/**
 * The Roof Doctors — Background Job Queue
 * Handles asynchronous workflows: email, SMS, ROOFR synchronization, AI analysis, storm ingestion.
 */

import { getDatabase, persistDatabase, generateId } from '../db/database.ts';
import type { BackgroundJob } from '../../shared/types/index.ts';

export function enqueueJob(
  jobType: BackgroundJob['jobType'],
  payload: Record<string, any>,
  scheduledFor?: string
): BackgroundJob {
  const db = getDatabase();
  const job: BackgroundJob = {
    id: generateId('job'),
    jobType,
    payload,
    status: 'QUEUED',
    attempts: 0,
    maxAttempts: 3,
    scheduledFor: scheduledFor || new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  db.backgroundJobs.unshift(job);
  persistDatabase();
  console.log(`[JobQueue] Enqueued job ${job.id} (${job.jobType})`);
  return job;
}

export function getJobs(status?: BackgroundJob['status']): BackgroundJob[] {
  const db = getDatabase();
  if (!status) return db.backgroundJobs;
  return db.backgroundJobs.filter((j) => j.status === status);
}

export function updateJobStatus(
  jobId: string,
  status: BackgroundJob['status'],
  error?: string
): BackgroundJob | null {
  const db = getDatabase();
  const job = db.backgroundJobs.find((j) => j.id === jobId);
  if (!job) return null;

  job.status = status;
  if (error) {
    job.lastError = error;
    job.attempts += 1;
  }
  if (status === 'SUCCEEDED') {
    job.completedAt = new Date().toISOString();
  }

  persistDatabase();
  return job;
}
