// User Switcher Configuration
// Configure which users can access the user switching functionality

export const USER_SWITCHER_CONFIG = {
  // Method 1: Specify specific user IDs
  allowedUserIds: [
   "011d2539-69e1-4a62-b4ae-478cb10aca6d", "490c4ced-5176-4726-85d8-c552b95b6504" ,"f88c2406-12d8-4294-8738-9690eaf1da15"
  ],

  // Method 2: Specify specific user emails
  allowedUserEmails: [
    // Add specific user emails here
    // Example: 'admin@example.com', 'manager@example.com'
  ],

  // Method 3: Specify user roles (default behavior if no specific users are listed)
  allowedRoles: ['admin', 'manager'],

  // Method 4: Disable for all users (set to true to disable completely)
  disabled: false
};

// Helper function to check if a user can switch
export const canUserSwitch = (user) => {
  if (!user || USER_SWITCHER_CONFIG.disabled) {
    return false;
  }

  // Check specific user IDs
  if (USER_SWITCHER_CONFIG.allowedUserIds.length > 0) {
    if (USER_SWITCHER_CONFIG.allowedUserIds.includes(user.id)) {
      return true;
    }
  }

  // Check specific user emails
  if (USER_SWITCHER_CONFIG.allowedUserEmails.length > 0) {
    if (USER_SWITCHER_CONFIG.allowedUserEmails.includes(user.email)) {
      return true;
    }
  }

  // Check roles (default behavior)
  if (USER_SWITCHER_CONFIG.allowedRoles.length > 0) {
    if (USER_SWITCHER_CONFIG.allowedRoles.includes(user.role)) {
      return true;
    }
  }

  return false;
};

// Get the allowed users array for the UserSwitcher component
export const getAllowedUsers = () => {
  if (USER_SWITCHER_CONFIG.disabled) {
    return [];
  }

  const allowedUsers = [
    ...USER_SWITCHER_CONFIG.allowedUserIds,
    ...USER_SWITCHER_CONFIG.allowedUserEmails
  ];

  // If no specific users are configured, return null for default role-based behavior
  return allowedUsers.length > 0 ? allowedUsers : null;
};
