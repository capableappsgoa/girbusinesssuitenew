import { useEffect } from 'react';
import onlineStatusService from '../services/onlineStatusService';

export const useOnlineStatus = () => {
  useEffect(() => {
    // Initialize online status service when component mounts
    onlineStatusService.initialize();

    // Cleanup when component unmounts
    return () => {
      onlineStatusService.disconnect();
    };
  }, []);

  return {
    getOnlineUsers: onlineStatusService.getOnlineUsers.bind(onlineStatusService),
    getUserStatus: onlineStatusService.getUserStatus.bind(onlineStatusService),
    isUserOnline: onlineStatusService.isUserOnline.bind(onlineStatusService),
    getOnlineUsersCount: onlineStatusService.getOnlineUsersCount.bind(onlineStatusService),
    updatePresence: onlineStatusService.updatePresence.bind(onlineStatusService)
  };
}; 