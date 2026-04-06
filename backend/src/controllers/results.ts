import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma';
import { getSignedUrlForReport } from '../services/s3';

export const getSessionResult = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionId } = req.params;
    const userId = (req as any).user.userId;

    const session = await prisma.testSession.findUnique({
      where: { id: sessionId },
      include: { riskScore: true, results: true }
    });

    if (!session || session.userId !== userId) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json(session);
  } catch (err) {
    next(err);
  }
};

export const getHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [sessions, total] = await Promise.all([
      prisma.testSession.findMany({
        where: { userId },
        include: { riskScore: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.testSession.count({ where: { userId } })
    ]);

    res.json({
      sessions,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) {
    next(err);
  }
};

export const getReportUrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionId } = req.params;
    const userId = (req as any).user.userId;

    const session = await prisma.testSession.findUnique({
      where: { id: sessionId }
    });

    if (!session || session.userId !== userId) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const url = await getSignedUrlForReport(sessionId);
    res.json({ url });
  } catch (err) {
    next(err);
  }
};
