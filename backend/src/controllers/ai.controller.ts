import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { processAiAssistantChat } from '../services/ai.service';

export const handleAiChat = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);
    const { prompt, budget } = req.body;

    if (!prompt) return sendError(res, 'Prompt is required for AI Assistant', 400);

    const aiResponse = await processAiAssistantChat(req.user.userId, prompt, budget);
    return sendSuccess(res, aiResponse, 'AI response generated');
  } catch (error: any) {
    return sendError(res, error.message || 'AI Assistant service error', 500);
  }
};
