import { supabase } from '../lib/supabase';

class OnlineStatusService {
  constructor() {
    this.channel = null;
    this.isSubscribed = false;
    this.currentUser = null;
  }

  async initialize() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      this.currentUser = user;
      
      if (!user) {
        console.warn('No authenticated user found for online status');
        return;
      }

      // Create presence channel
      this.channel = supabase.channel('online_users');

      // Subscribe to presence events
      this.channel
        .on('presence', { event: 'sync' }, () => {
          console.log('Presence sync');
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          console.log('User joined:', newPresences);
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          console.log('User left:', leftPresences);
        })
        .subscribe(async (status) => {
          this.isSubscribed = status === 'SUBSCRIBED';
          
          if (this.isSubscribed) {
            // Track current user's presence
            await this.trackPresence();
          }
        });

    } catch (error) {
      console.error('Error initializing online status service:', error);
    }
  }

  async trackPresence() {
    if (!this.currentUser || !this.channel) return;

    try {
      const userData = {
        user_id: this.currentUser.id,
        name: this.currentUser.user_metadata?.name || this.currentUser.email?.split('@')[0] || 'Unknown',
        role: this.currentUser.user_metadata?.role || 'user',
        email: this.currentUser.email,
        last_seen: new Date().toISOString(),
        avatar: this.currentUser.user_metadata?.avatar || null
      };

      await this.channel.track(userData);
      console.log('Presence tracked for user:', userData.name);
    } catch (error) {
      console.error('Error tracking presence:', error);
    }
  }

  async updatePresence() {
    if (!this.isSubscribed) return;
    await this.trackPresence();
  }

  async getOnlineUsers() {
    if (!this.channel) return [];

    try {
      const state = this.channel.presenceState();
      return Object.values(state).flat().map(user => ({
        id: user.user_id,
        name: user.name || 'Unknown User',
        role: user.role || 'user',
        email: user.email,
        avatar: user.avatar,
        lastSeen: user.last_seen || new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error getting online users:', error);
      return [];
    }
  }

  async disconnect() {
    if (this.channel) {
      await this.channel.untrack();
      supabase.removeChannel(this.channel);
      this.channel = null;
      this.isSubscribed = false;
    }
  }

  // Get user's online status
  async getUserStatus(userId) {
    if (!this.channel) return 'offline';

    try {
      const state = this.channel.presenceState();
      const userPresence = Object.values(state).flat().find(user => user.user_id === userId);
      return userPresence ? 'online' : 'offline';
    } catch (error) {
      console.error('Error getting user status:', error);
      return 'offline';
    }
  }

  // Check if user is currently online
  isUserOnline(userId) {
    if (!this.channel) return false;

    try {
      const state = this.channel.presenceState();
      return Object.values(state).flat().some(user => user.user_id === userId);
    } catch (error) {
      console.error('Error checking if user is online:', error);
      return false;
    }
  }

  // Get online users count
  getOnlineUsersCount() {
    if (!this.channel) return 0;

    try {
      const state = this.channel.presenceState();
      return Object.values(state).flat().length;
    } catch (error) {
      console.error('Error getting online users count:', error);
      return 0;
    }
  }
}

// Create singleton instance
const onlineStatusService = new OnlineStatusService();

export default onlineStatusService; 