import express from 'express';
import { message, initializeChat } from '../services/chatService.js';

const router = express.Router();

router.post('/initialize', async (req, res) => {
  try {
    const {
      startingSalary,
      jobTitle,
      marketAverage,
      targetGoal,
    } = req.body;

    console.log('Initialize chat payload:', req.body);

    if (
      typeof startingSalary !== 'number' ||
      typeof marketAverage !== 'number' ||
      typeof targetGoal !== 'number' ||
      !jobTitle?.trim()
    ) {
      return res.status(400).json({
        error: 'Invalid or missing fields',
        received: req.body,
      });
    }

    await initializeChat({
      startingSalary,
      jobTitle,
      marketAverage,
      targetGoal,
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Chat initialization error:', err);
    res.status(500).json({ error: 'Failed to initialize chat' });
  }
});



router.post('/message', async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'prompt is required' });
        }

        const response = await message(prompt);
        res.json({ response });
    } catch (error) {
        console.error('Error in /api/chat/message:', error);
        res.status(500).json({ error: error.message });
    }
});
export default router;

