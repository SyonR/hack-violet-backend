import fetch from 'node-fetch';

// BLS (Bureau of Labor Statistics) API endpoint
const BLS_API_URL = 'https://api.bls.gov/publicAPI/v2/timeseries/data/';

// Map job titles to BLS occupation codes
const JOB_TO_BLS_CODE = {
  'Software Engineer': 'OEUM000000151132',
  'Marketing Manager': 'OEUM000000112020',
  'Data Analyst': 'OEUM000000152098',
  'Product Manager': 'OEUM000000111021',
  'Sales Representative': 'OEUM000000414012',
  'UX Designer': 'OEUM000000271024',
  'HR Manager': 'OEUM000000113121',
  'Accountant': 'OEUM000000132011',
  'Project Manager': 'OEUM000000119111',
  'Business Analyst': 'OEUM000000131111'
};

// Fallback data (used if API fails or for jobs not in BLS)
const FALLBACK_SALARY_DATA = {
  'Software Engineer': { marketRate: 95000, range: [75000, 130000] },
  'Marketing Manager': { marketRate: 75000, range: [60000, 95000] },
  'Data Analyst': { marketRate: 70000, range: [55000, 90000] },
  'Product Manager': { marketRate: 110000, range: [90000, 145000] },
  'Sales Representative': { marketRate: 65000, range: [45000, 85000] },
  'UX Designer': { marketRate: 85000, range: [65000, 110000] },
  'HR Manager': { marketRate: 72000, range: [58000, 92000] },
  'Accountant': { marketRate: 68000, range: [52000, 88000] },
  'Project Manager': { marketRate: 88000, range: [70000, 115000] },
  'Business Analyst': { marketRate: 78000, range: [62000, 98000] }
};

/**
 * Fetch salary data from BLS API
 * For MVP, we'll use fallback data (BLS API is complex and rate-limited)
 */
export async function getSalaryData(jobTitle) {
  try {
    // For hackathon MVP, use fallback data
    // In production, you'd call the BLS API here
    const salaryData = FALLBACK_SALARY_DATA[jobTitle];
    
    if (!salaryData) {
      throw new Error(`Job title "${jobTitle}" not found`);
    }

    return {
      jobTitle,
      marketRate: salaryData.marketRate,
      range: salaryData.range,
      source: 'Industry Research',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching salary data:', error);
    throw error;
  }
}

/**
 * Calculate target salary based on achievements
 */
export function calculateTargetSalary(marketRate, achievements, currentSalary = 0) {
  const ACHIEVEMENT_BONUSES = {
    'Exceeded performance targets': 0.05,
    'Taken on additional responsibilities': 0.04,
    'Gained new certifications/skills': 0.03,
    'Led successful projects': 0.05,
    'Mentored team members': 0.03
  };

  let totalBonus = 0;
  achievements.forEach(achievement => {
    if (ACHIEVEMENT_BONUSES[achievement]) {
      totalBonus += ACHIEVEMENT_BONUSES[achievement];
    }
  });

  // Calculate target based on market rate
  const marketBasedTarget = Math.round(marketRate * (1 + totalBonus));
  
  // Calculate target based on current salary (for those already above market)
  const currentBasedTarget = Math.round(currentSalary * (1 + totalBonus));
  
  // Use whichever is higher
  const targetSalary = Math.max(marketBasedTarget, currentBasedTarget);
  
  // Calculate target range (±5% of target)
  const targetMin = Math.round(targetSalary * 0.95);
  const targetMax = Math.round(targetSalary * 1.05);
  
  return {
    marketRate,
    bonusPercentage: totalBonus,
    targetSalary,
    targetRange: [targetMin, targetMax],
    achievements,
    baselineUsed: targetSalary === marketBasedTarget ? 'market' : 'current',
    // Calculation breakdown for tooltip
    calculation: {
      baseAmount: targetSalary === marketBasedTarget ? marketRate : currentSalary,
      baseType: targetSalary === marketBasedTarget ? 'Market Rate' : 'Current Salary',
      bonusPercentage: totalBonus,
      bonusAmount: Math.round((targetSalary === marketBasedTarget ? marketRate : currentSalary) * totalBonus),
      targetSalary
    }
  };
}