import express from 'express';
import { getSalaryData, calculateTargetSalary } from '../services/blsService.js';

const router = express.Router();

/**
 * GET /api/salary?job=Software%20Engineer
 * Returns market salary data for a job title
 */
router.get('/', async (req, res) => {
  try {
    const { job } = req.query;

    if (!job) {
      return res.status(400).json({ 
        error: 'Job title is required',
        example: '/api/salary?job=Software%20Engineer'
      });
    }

    const salaryData = await getSalaryData(job);
    res.json(salaryData);
  } catch (error) {
    res.status(404).json({ 
      error: error.message 
    });
  }
});

/**
 * POST /api/salary/calculate
 * Calculates target salary based on market rate and achievements
 * Body: { marketRate: 95000, achievements: ["Exceeded performance targets"] }
 */
router.post('/calculate', async (req, res) => {
  try {
    const { marketRate, achievements, currentSalary} = req.body;

    if (!marketRate || !achievements) {
      return res.status(400).json({ 
        error: 'marketRate and achievements are required' 
      });
    }

    const result = calculateTargetSalary(marketRate, achievements, currentSalary || 0);
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      error: error.message 
    });
  }
});

export default router;