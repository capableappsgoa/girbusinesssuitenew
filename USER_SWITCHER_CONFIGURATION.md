# User Switcher Configuration

The User Switcher functionality allows specific users to switch between different user accounts without logging out and back in. This feature is now only available in the top navigation bar and can be configured for specific users.

## Configuration

Edit the file `src/config/userSwitcherConfig.js` to configure which users can access the user switching functionality.

### Configuration Options

#### Method 1: Specify User IDs
```javascript
allowedUserIds: [
  'user-id-1',
  'user-id-2',
  // Add more user IDs as needed
],
```

#### Method 2: Specify User Emails
```javascript
allowedUserEmails: [
  'admin@example.com',
  'manager@example.com',
  // Add more user emails as needed
],
```

#### Method 3: Specify User Roles (Default)
```javascript
allowedRoles: ['admin', 'manager'],
```

#### Method 4: Disable Completely
```javascript
disabled: true, // Set to true to disable for all users
```

## Examples

### Example 1: Allow only specific users by email
```javascript
export const USER_SWITCHER_CONFIG = {
  allowedUserIds: [],
  allowedUserEmails: [
    'john@company.com',
    'sarah@company.com'
  ],
  allowedRoles: [], // Empty array means no role-based access
  disabled: false
};
```

### Example 2: Allow only admins (default behavior)
```javascript
export const USER_SWITCHER_CONFIG = {
  allowedUserIds: [],
  allowedUserEmails: [],
  allowedRoles: ['admin'],
  disabled: false
};
```

### Example 3: Allow admins and managers
```javascript
export const USER_SWITCHER_CONFIG = {
  allowedUserIds: [],
  allowedUserEmails: [],
  allowedRoles: ['admin', 'manager'],
  disabled: false
};
```

### Example 4: Disable completely
```javascript
export const USER_SWITCHER_CONFIG = {
  allowedUserIds: [],
  allowedUserEmails: [],
  allowedRoles: [],
  disabled: true
};
```

## How It Works

1. **Priority Order**: The system checks in this order:
   - First: Specific user IDs
   - Second: Specific user emails
   - Third: User roles
   - If none match: Access denied

2. **Location**: The User Switcher is only available in the top navigation bar (Layout component)

3. **Removed From**: The User Switcher has been removed from all individual dashboard pages:
   - Dashboard
   - Tasks
   - Projects
   - Revenue
   - Companies
   - Invoice

## Usage

Once configured, authorized users will see a "Switch User" button in the top navigation bar. They can:

1. Click "Switch User" to see a dropdown of all available users
2. Select a user to switch to their dashboard view
3. Use "Switch Back" to return to their original account
4. Logout normally (automatically switches back if needed)

## Security Notes

- Users can only switch to view other users' dashboards
- They cannot perform actions on behalf of other users
- The original user session is preserved for switching back
- All actions are logged under the original user's account
