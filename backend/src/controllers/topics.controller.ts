import { Request, Response } from 'express';
import { GroqService } from '../services/GroqService';

export const getTopic = async (req: Request, res: Response) => {
  const { exclude } = req.body;
  const excludeList = Array.isArray(exclude) ? exclude.map(String) : [];

  const start = Date.now();
  try {
    const topicText = await GroqService.generateTopic(excludeList);
    
    // Save model execution time in res.locals for logger middleware
    res.locals.groqLatency = Date.now() - start;

    return res.status(200).json({
      success: true,
      topic: topicText
    });
  } catch (error: any) {
    res.locals.groqLatency = Date.now() - start;
    console.error('[TopicsController] Error:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Unable to generate topic.',
      error: error.message || String(error)
    });
  }
};
