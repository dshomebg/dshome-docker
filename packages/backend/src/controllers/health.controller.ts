import { Request, Response } from 'express';
import { db } from '../db';
import { sql } from 'drizzle-orm';

export const healthCheck = async (req: Request, res: Response) => {
  try {
    // Check database connection
    await db.execute(sql`SELECT 1`);

    res.json({
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: 'connected'
      }
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(503).json({
      success: false,
      data: {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Database connection failed',
        details: error instanceof Error ? error.message : String(error)
      }
    });
  }
};
