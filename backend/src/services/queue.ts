import { Queue } from 'bullmq';

const connection = {
    host: 'localhost',
    port: 6379,
  };

export const analysisQueue = new Queue('analysis-queue', {
  connection
});

export const enqueueAnalysisJob = async (sessionId: string, testData: any) => {
  console.log(`Enqueuing analysis job for session: ${sessionId}`);
  await analysisQueue.add('analyzeSession', { sessionId, testData }, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 }
  });
};
