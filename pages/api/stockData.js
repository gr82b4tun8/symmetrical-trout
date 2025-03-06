// pages/api/stockData.js

export default async function handler(req, res) {
  try {
    const { symbol, date } = req.query;

    if (!symbol) {
      return res.status(400).json({ error: 'Symbol is required' });
    }

    // Log the request details
    console.log(`Fetching data for symbol: ${symbol}, date: ${date}`);

    // Construct the API URL
    const apiUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=5min&outputsize=full&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`;
    
    console.log('Calling Alpha Vantage API...');
    const response = await fetch(apiUrl);

    if (!response.ok) {
      console.error(`API response not ok: ${response.status} ${response.statusText}`);
      return res.status(response.status).json({ 
        error: `Alpha Vantage API error: ${response.statusText}` 
      });
    }

    const data = await response.json();
    
    // Log the response structure
    console.log('API Response structure:', Object.keys(data));

    // Check for API error messages
    if (data['Error Message']) {
      console.error('Alpha Vantage error:', data['Error Message']);
      return res.status(400).json({ error: data['Error Message'] });
    }

    if (data['Note']) {
      console.warn('Alpha Vantage note:', data['Note']);
      return res.status(429).json({ 
        error: 'API call frequency limit reached. Please try again in a minute.' 
      });
    }

    // Verify the data structure
    const timeSeriesData = data['Time Series (5min)'];
    if (!timeSeriesData || Object.keys(timeSeriesData).length === 0) {
      console.error('No time series data found in response');
      return res.status(404).json({ 
        error: 'No data available for this symbol. Please verify the symbol is correct.' 
      });
    }

    // Log success
    console.log(`Successfully fetched data for ${symbol}. Data points: ${Object.keys(timeSeriesData).length}`);

    res.status(200).json(data);
    
  } catch (error) {
    console.error('Stock API Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch stock data. Please try again later.' 
    });
  }
}