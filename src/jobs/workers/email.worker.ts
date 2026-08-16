import { Worker, Job } from 'bullmq';
import { redisConfig } from '@/config/redis';
import { EMAIL_QUEUE_NAME, IEmailJobData } from '../queues/email.queue';
import { logger } from '@/utils/logger';

export const emailWorker = new Worker<IEmailJobData>(
  EMAIL_QUEUE_NAME,
  async (job: Job<IEmailJobData>) => {
    logger.info(`Processing Email Job [${job.id}] to: ${job.data.to}`);
    // Async email sending execution logic placeholder
    await new Promise((resolve) => setTimeout(resolve, 500));
    logger.info(`Email successfully sent to: ${job.data.to}`);
  },
  { connection: redisConfig }
);

emailWorker.on('completed', (job) => {
  logger.info(`Email Job [${job.id}] completed successfully`);
});

emailWorker.on('failed', (job, err) => {
  logger.error(`Email Job [${job?.id}] failed: ${err.message}`);
});
