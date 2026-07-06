import { Request, Response } from 'express';
import { GroqService } from '../services/GroqService';

export const analyzeSpeech = async (req: Request, res: Response) => {
  const { mode, topic, content } = req.body;
  console.log(`[AnalyzeController] Received request: mode=${mode}, topic=${topic}, contentLen=${content?.length}`);

  const start = Date.now();
  try {
    console.log('[AnalyzeController] Invoking GroqService...');
    const feedback = await GroqService.analyzeResponse(mode, topic, content);
    console.log('[AnalyzeController] GroqService response received successfully!');
    
    // Store Groq latency in res.locals for log recording
    res.locals.groqLatency = Date.now() - start;

    // Return successfully parsed JSON response
    return res.status(200).json({
      success: true,
      ...feedback
    });
  } catch (error: any) {
    res.locals.groqLatency = Date.now() - start;
    console.error('[AnalyzeController] Speech analysis failed:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Unable to analyze response.',
      error: error?.message || String(error)
    });
  }
};
export default analyzeSpeech;
