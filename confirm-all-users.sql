-- Query to confirm all users in the database
-- This query shows all users with their details and related information

-- 1. Basic user information
SELECT 
    u.id,
    u.email,
    u.name,
    u.role,
    u.avatar,
    u.phone,
    u.department,
    u.position,
    u.is_active,
    u.created_at,
    u.updated_at,
    -- Count related data
    (SELECT COUNT(*) FROM projects WHERE created_by = u.id) as projects_created,
    (SELECT COUNT(*) FROM tasks WHERE assigned_to = u.id) as tasks_assigned,
    (SELECT COUNT(*) FROM issues WHERE reported_by = u.id) as issues_reported,
    (SELECT COUNT(*) FROM issues WHERE assigned_to = u.id) as issues_assigned,
    (SELECT COUNT(*) FROM team_members WHERE user_id = u.id) as team_memberships
FROM users u
ORDER BY u.created_at DESC;

-- 2. Users by role (summary)
SELECT 
    role,
    COUNT(*) as user_count,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_users,
    COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_users
FROM users 
GROUP BY role
ORDER BY user_count DESC;

-- 3. Recent users (last 30 days)
SELECT 
    id,
    email,
    name,
    role,
    is_active,
    created_at
FROM users 
WHERE created_at >= NOW() - INTERVAL '30 days'
ORDER BY created_at DESC;

-- 4. Users with no activity (no projects, tasks, or issues)
SELECT 
    u.id,
    u.email,
    u.name,
    u.role,
    u.created_at
FROM users u
WHERE u.id NOT IN (
    SELECT DISTINCT created_by FROM projects WHERE created_by IS NOT NULL
    UNION
    SELECT DISTINCT assigned_to FROM tasks WHERE assigned_to IS NOT NULL
    UNION
    SELECT DISTINCT reported_by FROM issues WHERE reported_by IS NOT NULL
    UNION
    SELECT DISTINCT assigned_to FROM issues WHERE assigned_to IS NOT NULL
)
ORDER BY u.created_at DESC;

-- 5. Active users with their latest activity
SELECT 
    u.id,
    u.email,
    u.name,
    u.role,
    u.is_active,
    u.created_at,
    GREATEST(
        COALESCE((SELECT MAX(created_at) FROM projects WHERE created_by = u.id), '1900-01-01'),
        COALESCE((SELECT MAX(updated_at) FROM tasks WHERE assigned_to = u.id), '1900-01-01'),
        COALESCE((SELECT MAX(updated_at) FROM issues WHERE assigned_to = u.id OR reported_by = u.id), '1900-01-01')
    ) as last_activity
FROM users u
WHERE u.is_active = true
ORDER BY last_activity DESC;

-- 6. User statistics summary
SELECT 
    'Total Users' as metric,
    COUNT(*) as value
FROM users
UNION ALL
SELECT 
    'Active Users' as metric,
    COUNT(*) as value
FROM users
WHERE is_active = true
UNION ALL
SELECT 
    'Inactive Users' as metric,
    COUNT(*) as value
FROM users
WHERE is_active = false
UNION ALL
SELECT 
    'Admin Users' as metric,
    COUNT(*) as value
FROM users
WHERE role = 'admin'
UNION ALL
SELECT 
    'Manager Users' as metric,
    COUNT(*) as value
FROM users
WHERE role = 'manager'
UNION ALL
SELECT 
    'Designer Users' as metric,
    COUNT(*) as value
FROM users
WHERE role = 'designer'
UNION ALL
SELECT 
    'Billing Users' as metric,
    COUNT(*) as value
FROM users
WHERE role = 'billing'
UNION ALL
SELECT 
    'Client Users' as metric,
    COUNT(*) as value
FROM users
WHERE role = 'client'; 