# Online Status Feature Setup

This document explains how to set up and use the online status feature that shows who's currently online in your dashboard.

## Features

- **Real-time Online Status**: Shows who's currently online
- **User Role Display**: Displays user roles (admin, manager, designer, billing, client)
- **Last Seen Timestamps**: Shows when users were last active
- **Auto-cleanup**: Automatically removes offline users after 5 minutes
- **Dashboard Integration**: Available on both admin and designer dashboards

## Setup Instructions

### 1. Database Setup

Run the SQL script to create the necessary tables and functions:

```sql
-- Execute the setup-online-status.sql file in your Supabase SQL editor
```

This will create:
- `online_status` table for tracking user online status
- Functions for updating and retrieving online status
- RLS policies for security
- Indexes for performance

### 2. Component Integration

The online status feature is already integrated into:

- **Admin Dashboard**: Shows in the project distribution section
- **Designer Dashboard**: Shows as a separate card
- **Main App**: Initializes the online status service

### 3. How It Works

#### Real-time Updates
- Uses Supabase Realtime with presence channels
- Updates every 30 seconds to keep status current
- Automatically removes users after 5 minutes of inactivity

#### User Interface
- Green dot indicates online status
- Shows user name, role, and last seen time
- Color-coded role badges
- Loading state while fetching data

## Usage

### For Users
1. **View Online Users**: The online status component automatically appears on your dashboard
2. **Real-time Updates**: See who joins/leaves in real-time
3. **Role Information**: See what role each online user has

### For Developers
1. **Add to Components**: Import and use the `OnlineStatus` component
2. **Custom Styling**: Modify the component styles as needed
3. **Service Integration**: Use the `onlineStatusService` for custom implementations

## Components

### OnlineStatus Component
```jsx
import OnlineStatus from './components/dashboard/OnlineStatus';

// Use in any component
<OnlineStatus />
```

### Online Status Service
```javascript
import onlineStatusService from './services/onlineStatusService';

// Initialize
await onlineStatusService.initialize();

// Get online users
const users = await onlineStatusService.getOnlineUsers();

// Check if user is online
const isOnline = onlineStatusService.isUserOnline(userId);
```

### Online Indicator (Header)
```jsx
import OnlineIndicator from './components/common/OnlineIndicator';

// Use in header/navigation
<OnlineIndicator />
```

## Database Schema

### online_status Table
```sql
CREATE TABLE online_status (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  is_online BOOLEAN DEFAULT false,
  last_seen TIMESTAMP WITH TIME ZONE,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);
```

## API Functions

### Update User Status
```sql
SELECT update_user_online_status(user_id, is_online, user_agent, ip_address);
```

### Get Online Users
```sql
SELECT * FROM get_online_users();
```

### Check User Status
```sql
SELECT get_user_online_status(user_id);
```

## Troubleshooting

### Common Issues

1. **Users not showing as online**
   - Check if Supabase Realtime is enabled
   - Verify RLS policies are correct
   - Check browser console for errors

2. **Status not updating**
   - Ensure the service is initialized
   - Check network connectivity
   - Verify user authentication

3. **Performance issues**
   - The cleanup function runs automatically
   - Consider adjusting the update interval
   - Monitor database performance

### Debug Commands

```sql
-- Check online users
SELECT * FROM online_status WHERE is_online = true;

-- Check recent activity
SELECT * FROM online_status WHERE last_seen > NOW() - INTERVAL '10 minutes';

-- Clean up old records
SELECT cleanup_old_online_status();
```

## Security Considerations

- RLS policies ensure users can only see online status, not sensitive data
- User authentication is required to access online status
- No personal information is exposed beyond name and role
- Automatic cleanup prevents data accumulation

## Customization

### Styling
Modify the component styles in `OnlineStatus.js`:
```jsx
// Change colors, spacing, etc.
const getRoleBadge = (role) => {
  // Custom role badge styling
};
```

### Update Intervals
Adjust the update frequency in `OnlineStatus.js`:
```jsx
// Change from 30000ms (30 seconds) to your preferred interval
setInterval(updatePresence, 30000);
```

### Cleanup Timing
Modify the cleanup function in the database:
```sql
-- Change from 5 minutes to your preferred duration
WHERE last_seen > NOW() - INTERVAL '5 minutes'
```

## Future Enhancements

- **Typing Indicators**: Show when users are typing
- **Activity Status**: Show what users are working on
- **Presence History**: Track user activity patterns
- **Notifications**: Alert when specific users come online
- **Status Messages**: Allow users to set custom status messages 