import axios from 'axios';
import { POLYGON_API_KEY, POLYGON_REST_API_BASE_URL, formatPolygonDate } from '../../lib/polygonConfig';

export default async function handler(req, res) {
  const { symbol, date } = req.query;
  
  if (!symbol || !date) {
    return res.status(400).json({ error: 'Symbol and date are required' });
  }
  
  try {
    const formattedDate = formatPolygonDate(date);
    
    // Get aggregates (candles) for the specified date
    const response = await axios.get(
      `${POLYGON_REST_API_BASE_URL}/v2/aggs/ticker/${symbol}/range/1/minute/${formattedDate}/${formattedDate}`,
      {
        params: {
          adjusted: true,
          sort: 'asc',
          limit: 1440, // Maximum minutes in a day
          apiKey: POLYGON_API_KEY
        }
      }
    );
    
    if (response.status !== 200) {
      throw new Error('Failed to fetch data from Polygon.io');
    }
    
    const data = response.data;
    
    if (!data.results || data.results.length === 0) {
      return res.status(404).json({ error: 'No data available for this symbol and date' });
    }
    
    // Format the data for ApexCharts
    const formattedData = data.results.map(item => ({
      x: new Date(item.t).getTime(),
      y: [
        parseFloat(item.o), // Open
        parseFloat(item.h), // High
        parseFloat(item.l), // Low
        parseFloat(item.c)  // Close
      ]
    }));
    
    // Calculate basic stats
    const firstCandle = formattedData[0];
    const lastCandle = formattedData[formattedData.length - 1];
    const openPrice = firstCandle.y[0];
    const closePrice = lastCandle.y[3];
    const change = closePrice - openPrice;
    const changePct = (change / openPrice * 100).toFixed(2);
    
    const stats = {
      currentPrice: closePrice.toFixed(2),
      change: change.toFixed(2),
      changePct: changePct
    };
    
    return res.status(200).json({
      symbol,
      date,
      data: formattedData,
      stats
    });
    
  } catch (error) {
    console.error('Error fetching historical data:', error);
    return res.status(500).json({ error: 'Failed to fetch historical data' });
  }
}