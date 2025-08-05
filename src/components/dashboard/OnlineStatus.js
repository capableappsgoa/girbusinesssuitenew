import React, { useState, useEffect } from 'react';
import { Users, Wifi, WifiOff, Circle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const OnlineStatus = () => {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Subscribe to online status changes
    const channel = supabase
      .channel('online_users')
      .on('presence', { event: 'sync' }, () => {
        const state = supabase.channel('online_users').presenceState();
        const users = Object.values(state).flat().map(user => ({
          id: user.user_id,
          name: user.name || 'Unknown User',
          role: user.role || 'user',
          lastSeen: user.last_seen || new Date().toISOString()
        }));
        setOnlineUsers(users);
        setIsLoading(false);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track current user's presence
          await supabase.channel('online_users').track({
            user_id: (await supabase.auth.getUser()).data.user?.id,
            name: (await supabase.auth.getUser()).data.user?.user_metadata?.name || 'Unknown',
            role: (await supabase.auth.getUser()).data.user?.user_metadata?.role || 'user',
            last_seen: new Date().toISOString()
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Update presence every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      const user = (await supabase.auth.getUser()).data.user;
      if (user) {
        await supabase.channel('online_users').track({
          user_id: user.id,
          name: user.user_metadata?.name || 'Unknown',
          role: user.user_metadata?.role || 'user',
          last_seen: new Date().toISOString()
        });
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'text-red-600';
      case 'manager':
        return 'text-blue-600';
      case 'designer':
        return 'text-green-600';
      case 'billing':
        return 'text-purple-600';
      case 'client':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      case 'designer':
        return 'bg-green-100 text-green-800';
      case 'billing':
        return 'bg-purple-100 text-purple-800';
      case 'client':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Online Users</h3>
          <div className="flex items-center space-x-2">
            <Wifi size={16} className="text-green-500" />
            <span className="text-sm text-gray-500">Loading...</span>
          </div>
        </div>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Online Users</h3>
          <div className="flex items-center space-x-2">
            <Wifi size={16} className="text-green-500" />
            <span className="text-sm text-gray-500">{onlineUsers.length} online</span>
          </div>
        </div>
      </div>
      <div className="p-4">
        {onlineUsers.length === 0 ? (
          <div className="text-center py-4">
            <WifiOff size={24} className="text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No users currently online</p>
          </div>
        ) : (
          <div className="space-y-3">
            {onlineUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <Circle 
                      size={12} 
                      className="absolute -bottom-1 -right-1 text-green-500 fill-current" 
                    />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadge(user.role)}`}>
                      {user.role}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    {new Date(user.lastSeen).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OnlineStatus; 