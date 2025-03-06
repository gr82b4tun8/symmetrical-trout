// pages/api/calculateDays.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { startingAmount, returnPercentage, goalAmount } = req.body;
    
    // Validate inputs
    if (!startingAmount || !returnPercentage || !goalAmount) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    const start = parseFloat(startingAmount);
    const goal = parseFloat(goalAmount);
    const rate = parseFloat(returnPercentage) / 100;
    
    // Check for valid inputs
    if (isNaN(start) || isNaN(goal) || isNaN(rate)) {
      return res.status(400).json({ error: 'All inputs must be valid numbers' });
    }
    
    if (start <= 0 || goal <= 0 || rate <= 0) {
      return res.status(400).json({ error: 'All values must be positive numbers' });
    }
    
    if (start >= goal) {
      return res.status(400).json({ error: 'Goal amount must be greater than starting amount' });
    }
    
    // Calculate calendar days using the compound interest formula
    // FV = PV * (1 + r)^n, solve for n
    // n = log(FV/PV) / log(1 + r)
    const calendarDays = Math.ceil(Math.log(goal / start) / Math.log(1 + rate));
    
    // Calculate trading days (5 out of 7 days are trading days)
    const tradingDays = Math.ceil(calendarDays * (5 / 7));
    
    // Calculate years and months based on trading days
    // Assuming 252 trading days per year (5 days/week × 50.4 weeks/year)
    const tradingDaysPerYear = 252;
    const years = tradingDays / tradingDaysPerYear;
    const months = years * 12;
    
    // Calculate target date by adding calendar days
    const currentDate = new Date();
    const futureDate = new Date();
    
    // Add calendar days (which already account for weekends)
    futureDate.setDate(currentDate.getDate() + calendarDays);
    
    // Format the date as YYYY-MM-DD
    const targetDate = futureDate.toISOString().split('T')[0];
    
    return res.status(200).json({ 
      days: calendarDays,
      tradingDays: tradingDays,
      years: years.toFixed(2),
      months: months.toFixed(1),
      targetDate: targetDate
    });
  } catch (error) {
    console.error('Error calculating days:', error);
    return res.status(500).json({ error: 'Failed to calculate days' });
  }
}