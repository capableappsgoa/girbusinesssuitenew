import React from 'react';
import TasksSidebar from './TasksSidebar';

const TasksPage = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
        <p className="text-gray-600">View and manage your assigned tasks</p>
      </div>

      {/* Tasks Content */}
      <div className="bg-white rounded-lg border">
        <TasksSidebar />
      </div>
    </div>
  );
};

export default TasksPage; 