import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const OnlineIndicator = () => {
  const [onlineCount, setOnlineCount] = useState(0);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Check if user is online
    const checkOnlineStatus = () => {
      const state = supabase.channel('online_users')?.presenceState();
      if (state) {
        const users = Object.values(state).flat();
        setOnlineCount(users.length);
        setIsOnline(users.length > 0);
      }
    };

    // Initial check
    checkOnlineStatus();

    // Set up interval to check online status
    const interval = setInterval(checkOnlineStatus, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center space-x-2 text-sm">
      {isOnline ? (
        <Wifi size={16} className="text-green-500" />
      ) : (
        <WifiOff size={16} className="text-gray-400" />
      )}
      <span className={`text-xs ${isOnline ? 'text-green-600' : 'text-gray-500'}`}>
        {onlineCount} online
      </span>
    </div>
  );
};

export default OnlineIndicator; 