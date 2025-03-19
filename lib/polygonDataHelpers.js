// Process minute aggregate data from Polygon
export function processPolygonAggregateData(data) {
    // Process minute aggregate data from Polygon
    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }
  
    return data
      .filter(item => item.ev === 'AM') // Filter only minute aggregates
      .map(item => ({
        x: new Date(item.s).getTime(), // Start time
        y: [
          parseFloat(item.o), // Open
          parseFloat(item.h), // High
          parseFloat(item.l), // Low
          parseFloat(item.c)  // Close
        ]
      }));
  }
  
  // Process trade data for real-time price updates
  export function processPolygonTradeData(data, lastCandle) {
    if (!Array.isArray(data) || data.length === 0 || !lastCandle) {
      return null;
    }
    
    // Find the latest trade
    const latestTrade = data.find(item => item.ev === 'T');
    
    if (!latestTrade) {
      return null;
    }
    
    // Update the last candle with the trade price
    const updatedCandle = { ...lastCandle };
    const price = parseFloat(latestTrade.p);
    
    // Update high if price is higher
    if (price > updatedCandle.y[1]) {
      updatedCandle.y[1] = price;
    }
    
    // Update low if price is lower
    if (price < updatedCandle.y[2]) {
      updatedCandle.y[2] = price;
    }
    
    // Update close
    updatedCandle.y[3] = price;
    
    return updatedCandle;
  }
  
  // Calculate stats from candlestick data
  export function calculateStats(data) {
    if (!data || data.length === 0) {
      return null;
    }
    
    const firstCandle = data[0];
    const lastCandle = data[data.length - 1];
    
    const openPrice = firstCandle.y[0];
    const currentPrice = lastCandle.y[3];
    const change = currentPrice - openPrice;
    const changePct = (change / openPrice * 100).toFixed(2);
    
    return {
      currentPrice: currentPrice.toFixed(2),
      change: change.toFixed(2),
      changePct: changePct
    };
  }
  
  // Group trade data into candlesticks at the specified interval (in minutes)
  export function groupTradesIntoCandles(trades, interval = 1) {
    if (!trades || trades.length === 0) {
      return [];
    }
    
    const candles = {};
    const intervalMs = interval * 60 * 1000;
    
    trades.forEach(trade => {
      if (trade.ev !== 'T') return;
      
      const timestamp = new Date(trade.t);
      // Round down to the nearest interval
      const intervalStart = new Date(
        Math.floor(timestamp.getTime() / intervalMs) * intervalMs
      );
      
      const key = intervalStart.getTime();
      const price = parseFloat(trade.p);
      
      if (!candles[key]) {
        candles[key] = {
          x: key,
          y: [price, price, price, price] // [open, high, low, close]
        };
      } else {
        // Update high if price is higher
        if (price > candles[key].y[1]) {
          candles[key].y[1] = price;
        }
        
        // Update low if price is lower
        if (price < candles[key].y[2]) {
          candles[key].y[2] = price;
        }
        
        // Update close
        candles[key].y[3] = price;
      }
    });
    
    // Convert to array and sort by timestamp
    return Object.values(candles).sort((a, b) => a.x - b.x);
  }