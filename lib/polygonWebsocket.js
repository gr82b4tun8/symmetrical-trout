import { useState, useEffect, useRef } from 'react';

export function usePolygonWebsocket(apiKey, symbols = [], callback) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const websocketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // Handles the initial connection and reconnection logic
  const connect = () => {
    if (websocketRef.current?.readyState === WebSocket.OPEN) return;
    
    // Clear any pending reconnection
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    try {
      // Connect to Polygon.io websocket
      const ws = new WebSocket(`wss://socket.polygon.io/stocks`);
      websocketRef.current = ws;

      ws.onopen = () => {
        console.log('Connected to Polygon.io websocket');
        setIsConnected(true);
        setError(null);
        
        // Authenticate with API key
        ws.send(JSON.stringify({ action: 'auth', params: apiKey }));
        
        // Subscribe to the symbols
        if (symbols.length > 0) {
          subscribeToSymbols(symbols);
        }
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        // Handle authentication response
        if (data[0]?.ev === 'status' && data[0]?.status === 'auth_success') {
          console.log('Authenticated with Polygon.io');
        }
        
        // Send data to callback function
        if (callback && typeof callback === 'function') {
          callback(data);
        }
      };

      ws.onerror = (error) => {
        console.error('Websocket error:', error);
        setError('Failed to connect to market data');
      };

      ws.onclose = (event) => {
        console.log('Disconnected from Polygon.io websocket:', event.reason);
        setIsConnected(false);
        
        // Attempt to reconnect after a delay
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };
    } catch (err) {
      console.error('Error establishing websocket connection:', err);
      setError('Failed to connect to market data');
      
      // Attempt to reconnect after a delay
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 3000);
    }
  };

  // Subscribe to a list of symbols
  const subscribeToSymbols = (symbolList) => {
    if (!websocketRef.current || websocketRef.current.readyState !== WebSocket.OPEN) {
      console.warn('Cannot subscribe - websocket not connected');
      return;
    }
    
    // Subscribe to minute aggregates for the symbols
    websocketRef.current.send(JSON.stringify({
      action: 'subscribe',
      params: symbolList.map(symbol => `AM.${symbol}`)
    }));
    
    // Also subscribe to trades for real-time updates
    websocketRef.current.send(JSON.stringify({
      action: 'subscribe',
      params: symbolList.map(symbol => `T.${symbol}`)
    }));
  };

  // Unsubscribe from a list of symbols
  const unsubscribeFromSymbols = (symbolList) => {
    if (!websocketRef.current || websocketRef.current.readyState !== WebSocket.OPEN) {
      console.warn('Cannot unsubscribe - websocket not connected');
      return;
    }
    
    websocketRef.current.send(JSON.stringify({
      action: 'unsubscribe',
      params: [
        ...symbolList.map(symbol => `AM.${symbol}`),
        ...symbolList.map(symbol => `T.${symbol}`)
      ]
    }));
  };

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    connect();
    
    // Cleanup function
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (websocketRef.current) {
        websocketRef.current.close();
      }
    };
  }, [apiKey]);

  // Handle symbol changes
  useEffect(() => {
    if (isConnected && symbols.length > 0) {
      subscribeToSymbols(symbols);
    }
    
    return () => {
      if (isConnected && symbols.length > 0) {
        unsubscribeFromSymbols(symbols);
      }
    };
  }, [isConnected, symbols.join(',')]);

  return {
    isConnected,
    error,
    subscribe: subscribeToSymbols,
    unsubscribe: unsubscribeFromSymbols
  };
}