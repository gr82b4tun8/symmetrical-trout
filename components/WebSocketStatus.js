import React from 'react';

const WebSocketStatus = ({ isConnected, lastUpdateTime }) => {
  return (
    <div className="mb-4 flex items-center">
      <div 
        className={`w-3 h-3 rounded-full mr-2 ${
          isConnected 
            ? 'bg-[#00C853] animate-pulse' 
            : 'bg-[#FF3D71]'
        }`}
      ></div>
      <p className="text-sm text-gray-300">
        {isConnected ? 'Live Data Connected' : 'Connecting to live data...'}
        {lastUpdateTime && isConnected && (
          <span className="ml-2 text-gray-400">Last update: {lastUpdateTime}</span>
        )}
      </p>
    </div>
  );
};

export default WebSocketStatus;