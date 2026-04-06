import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma';
import { enqueueAnalysisJob } from '../services/queue';
import { uploadRawData } from '../services/s3';

export const submitTest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;

    const session = await prisma.testSession.create({
      data: {
        userId,
        status: 'PENDING'
      }
    });

    const testResults = [];
    let tests: any = {};

    try {
      tests = JSON.parse(req.body.tests || '{}');
    } catch (e) {
      tests = req.body.tests || {};
    }

    const files = (req.files as Express.Multer.File[]) || [];

    for (const [moduleName, data] of Object.entries(tests)) {
      let rawDataKey = null;

      const file = files.find(f => f.fieldname === moduleName);
      if (file) {
        rawDataKey = await uploadRawData(file.buffer, file.mimetype, file.originalname.split('.').pop() || 'bin');
      }

      const result = await prisma.testResult.create({
        data: {
          sessionId: session.id,
          moduleName,
          rawDataKey,
          metrics: data as any 
        }
      });
      testResults.push(result);
    }

    // Also handle files that didn't have corresponding JSON test data payload mapping
    for (const file of files) {
      if (!tests[file.fieldname]) {
         const rawDataKey = await uploadRawData(file.buffer, file.mimetype, file.originalname.split('.').pop() || 'bin');
         const result = await prisma.testResult.create({
          data: {
            sessionId: session.id,
            moduleName: file.fieldname,
            rawDataKey,
          }
        });
        testResults.push(result);
      }
    }

    await enqueueAnalysisJob(session.id, { tests, files: files.map(f => f.fieldname) });

    res.status(202).json({
      message: 'Test submitted and queued for analysis',
      sessionId: session.id
    });
  } catch (err) {
    next(err);
  }
};
