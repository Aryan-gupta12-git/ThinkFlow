import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

import app from '../backend/dist/app';

export default (req: any, res: any) => {
  try {
    return app(req, res);
  } catch (error: any) {
    console.error('[VercelWrapper] Request crashed:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Vercel Serverless Function execution crashed.',
        error: error?.message || String(error),
        stack: error?.stack || ''
      });
    }
  }
};
