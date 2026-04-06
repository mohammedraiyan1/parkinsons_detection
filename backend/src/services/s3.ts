import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'mock_key',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'mock_secret'
  }
});

export const uploadRawData = async (buffer: Buffer, mimetype: string, fileExtension: string) => {
  const key = `raw-data/${uuidv4()}.${fileExtension}`;
  
  if (process.env.AWS_ACCESS_KEY_ID === 'mock_key') {
    console.log(`Mock S3 Upload: ${key} (${mimetype})`);
    return key;
  }

  await s3Client.send(new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: mimetype
  }));

  return key;
};

export const getSignedUrlForReport = async (sessionId: string) => {
  // In a real implementation this creates a signed URL for a PDF using getSignedUrl
  return `https://mock-bucket.s3.amazonaws.com/reports/${sessionId}.pdf?signature=mock`;
};
