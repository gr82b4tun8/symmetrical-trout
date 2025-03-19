export const POLYGON_API_KEY = process.env.NEXT_PUBLIC_POLYGON_API_KEY || 'YOUR_POLYGON_API_KEY';

// Polygon.io REST API base URL
export const POLYGON_REST_API_BASE_URL = 'https://api.polygon.io';

// Helper function to format date for Polygon API
export function formatPolygonDate(date) {
  return date.replace(/-/g, '');
}

// Check if market is currently open (simplified)
export function isMarketOpen() {
  const now = new Date();
  const day = now.getDay();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const timeInMinutes = hours * 60 + minutes;
  
  // Market is closed on weekends (0 = Sunday, 6 = Saturday)
  if (day === 0 || day === 6) {
    return false;
  }
  
  // Market hours: 9:30 AM - 4:00 PM Eastern Time
  // Note: This is simplified and doesn't account for holidays or time zones
  const marketOpen = 9 * 60 + 30;  // 9:30 AM
  const marketClose = 16 * 60;     // 4:00 PM
  
  return timeInMinutes >= marketOpen && timeInMinutes <= marketClose;
}