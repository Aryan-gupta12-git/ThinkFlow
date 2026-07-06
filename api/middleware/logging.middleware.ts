import { Request, Response, NextFunction } from 'express';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  // Attach groqLatency tracker to res.locals so controllers can report model response times
  res.locals.groqLatency = 0;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const status = res.statusCode;
    
    // Log structured message to standard console
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ` +
      `Status: ${status} - ` +
      `Total Latency: ${duration}ms - ` +
      `Groq Latency: ${res.locals.groqLatency ? `${res.locals.groqLatency}ms` : 'N/A'} - ` +
      `IP: ${ip}`
    );
  });

  next();
};

export default requestLogger;
