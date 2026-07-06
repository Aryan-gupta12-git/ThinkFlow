import { Request, Response, NextFunction } from 'express';

export const validateAnalyzeRequest = (req: Request, res: Response, next: NextFunction) => {
  const { mode, topic, content } = req.body;
  console.log(`[ValidationMiddleware] Validating request: mode=${mode}, topicLen=${topic?.length}, contentLen=${content?.length}`);

  if (!mode || typeof mode !== 'string') {
    console.warn('[ValidationMiddleware] Validation failed: missing or invalid "mode"');
    return res.status(400).json({
      success: false,
      message: 'Invalid request: "mode" is a required string.'
    });
  }

  if (!topic || typeof topic !== 'string') {
    console.warn('[ValidationMiddleware] Validation failed: missing or invalid "topic"');
    return res.status(400).json({
      success: false,
      message: 'Invalid request: "topic" is a required string.'
    });
  }

  if (!content || typeof content !== 'string') {
    console.warn('[ValidationMiddleware] Validation failed: missing or invalid "content"');
    return res.status(400).json({
      success: false,
      message: 'Invalid request: "content" is a required string.'
    });
  }

  const cleanContent = content.trim();
  if (cleanContent.length === 0) {
    console.warn('[ValidationMiddleware] Validation failed: "content" is empty');
    return res.status(400).json({
      success: false,
      message: 'Invalid request: "content" cannot be empty.'
    });
  }

  console.log('[ValidationMiddleware] Validation succeeded.');
  next();
};
