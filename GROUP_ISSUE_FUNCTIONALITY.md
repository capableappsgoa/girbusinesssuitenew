# Group-Issue Functionality

## Overview
Added the ability to select task groups when reporting issues, allowing users to filter tasks by group and link issues to specific groups.

## Changes Made

### 1. Database Schema
- **File**: `add-group-id-to-issues.sql`
- **Action**: Added `group_id` column to the `issues` table
- **SQL Migration**:
  ```sql
  ALTER TABLE issues ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES task_groups(id) ON DELETE SET NULL;
  CREATE INDEX IF NOT EXISTS idx_issues_group_id ON issues(group_id);
  ```

### 2. Backend Services
- **File**: `src/services/projectService.js`
- **Changes**:
  - Updated `createIssue()` to include `group_id` field
  - Updated `updateIssue()` to handle `group_id` field
  - Updated `fetchProjectById()` and `fetchProjects()` to map `group_id` to `groupId`

### 3. Frontend Components
- **File**: `src/components/projects/ProjectIssues.js`
- **Changes**:
  - Added `groupId` to `newIssue` state
  - Added `loadTaskGroups` import and usage
  - Added group selection dropdown in issue creation modal
  - Added group selection dropdown in issue edit modal
  - Added `getFilteredTasks()` function to filter tasks by selected group
  - Added `getGroupName()` function to get group name by ID
  - Updated task selection to show filtered tasks based on selected group
  - Updated issue display to show group information for linked tasks
  - Added helper text to show which group is selected

### 4. User Interface Features

#### Issue Creation Modal
- **Group Selection**: Dropdown to select a task group (optional)
- **Task Filtering**: Tasks are filtered based on selected group
- **Visual Feedback**: Shows which group is selected and how many tasks are available
- **Reset Logic**: When group changes, task selection is reset

#### Issue Edit Modal
- **Group Selection**: Same functionality as creation modal
- **Current Group**: Shows the current group of the issue being edited
- **Task Filtering**: Filters tasks based on selected group

#### Issue Display
- **Group Information**: Shows group name in linked task display
- **Visual Indicators**: Clear indication of which group a task belongs to

### 5. Data Flow

1. **User selects a group** → Tasks are filtered to show only tasks from that group
2. **User selects a task** → Issue is linked to both the task and the group
3. **Issue is created/updated** → `groupId` is saved to database
4. **Issue is displayed** → Shows both task name and group name

### 6. Benefits

- **Better Organization**: Issues can be linked to specific task groups
- **Improved Filtering**: Users can easily find tasks within specific groups
- **Enhanced Tracking**: Clear visibility of which group an issue belongs to
- **User Experience**: Intuitive interface with clear visual feedback

## Usage Instructions

### For Users
1. Click "Report Issue" button
2. Fill in issue details (title, description, type, priority)
3. **Optional**: Select a task group from the dropdown
4. Select a task from the filtered list
5. Assign to a team member if needed
6. Click "Report Issue"

### For Developers
1. Run the SQL migration: `add-group-id-to-issues.sql`
2. The functionality is automatically available in the UI
3. Test by creating issues with different groups

## Testing
- **File**: `test-group-issue-functionality.js`
- **Purpose**: Verify that all components work correctly
- **Usage**: Run in browser console or Node.js environment

## Files Modified
- `src/components/projects/ProjectIssues.js` - Main UI component
- `src/services/projectService.js` - Backend services
- `add-group-id-to-issues.sql` - Database migration
- `test-group-issue-functionality.js` - Test script
- `GROUP_ISSUE_FUNCTIONALITY.md` - This documentation

## Next Steps
1. Run the database migration in Supabase SQL Editor
2. Test the functionality by creating issues with different groups
3. Verify that group information is displayed correctly
4. Consider adding group-based filtering to the issues list view
