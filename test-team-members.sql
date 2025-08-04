-- Test team members loading and add sample data if needed

-- Check if team_members table exists and has data
SELECT 
  'Team members table check:' as info,
  COUNT(*) as total_team_members
FROM team_members;

-- Check team members per project
SELECT 
  'Team members by project:' as info,
  p.name as project_name,
  COUNT(tm.id) as team_member_count
FROM projects p
LEFT JOIN team_members tm ON p.id = tm.project_id
GROUP BY p.id, p.name
ORDER BY p.name;

-- Check if users exist
SELECT 
  'Users check:' as info,
  COUNT(*) as total_users,
  COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_users,
  COUNT(CASE WHEN role != 'admin' THEN 1 END) as regular_users
FROM users;

-- Show sample users
SELECT 
  'Sample users:' as info,
  id,
  name,
  email,
  role
FROM users
LIMIT 5;

-- Add sample team members if none exist
INSERT INTO team_members (user_id, project_id, role)
SELECT 
  u.id,
  p.id,
  CASE 
    WHEN u.role = 'admin' THEN 'admin'
    ELSE 'member'
  END
FROM users u
CROSS JOIN projects p
WHERE NOT EXISTS (
  SELECT 1 FROM team_members tm 
  WHERE tm.user_id = u.id AND tm.project_id = p.id
)
LIMIT 10;

-- Verify team members were added
SELECT 
  'Team members after adding sample data:' as info,
  COUNT(*) as total_team_members
FROM team_members;

-- Show team members with user details
SELECT 
  'Team members with user details:' as info,
  tm.project_id,
  p.name as project_name,
  u.name as user_name,
  u.email as user_email,
  tm.role as team_role
FROM team_members tm
JOIN projects p ON tm.project_id = p.id
JOIN users u ON tm.user_id = u.id
ORDER BY p.name, u.name
LIMIT 10; 