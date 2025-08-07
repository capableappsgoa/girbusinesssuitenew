import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { 
  fetchProjects, 
  createProject as createProjectService, 
  updateProject as updateProjectService, 
  deleteProject as deleteProjectService,
  fetchProjectById,
  fetchProjectTasks,
  createTask as createTaskService,
  updateTask as updateTaskService,
  deleteTask as deleteTaskService,
  createIssue as createIssueService,
  updateIssue as updateIssueService,
  deleteIssue as deleteIssueService,
  createBillingItem as createBillingItemService,
  updateBillingItem as updateBillingItemService,
  deleteBillingItem as deleteBillingItemService,
  fetchCompanies,
  createCompanyService,
  updateCompanyService,
  deleteCompanyService,
  markProjectAsPaid,
  markProjectAsUnpaid,
  updateProjectDiscount,
  fetchCompanyById,
  fetchTaskGroups,
  createTaskGroup as createTaskGroupService,
  updateTaskGroup as updateTaskGroupService,
  deleteTaskGroup as deleteTaskGroupService,
  updateProjectAdvance,
  getProjectAdvance
} from '../services/projectService';

const useProjectStore = create(
  persist(
    (set, get) => ({
      projects: [],
      currentProject: null,
      companies: [],
      isLoading: false,
      invoiceDiscountPercentage: 0,

      // Clear all data and load fresh from database
      clearAndLoadProjects: async () => {
        // Clear any persisted data from localStorage
        try {
          localStorage.removeItem('project-storage');
        } catch (error) {
          console.log('No persisted data to clear');
        }
        
        set({ projects: [], isLoading: true });
        try {
          const projects = await fetchProjects();
          set({ projects, isLoading: false });
        } catch (error) {
          console.error('Failed to load projects:', error);
          set({ isLoading: false });
        }
      },

      // Load projects from database
      loadProjects: async () => {
        set({ isLoading: true });
        try {
          const projects = await fetchProjects();
          set({ projects, isLoading: false });
        } catch (error) {
          console.error('Failed to load projects:', error);
          set({ isLoading: false });
        }
      },

      // Load a single project by ID with all related data
      loadProject: async (projectId) => {
        set({ isLoading: true });
        try {
          const project = await fetchProjectById(projectId);
          if (project) {
            set((state) => ({
              projects: state.projects.map(p => 
                p.id === projectId ? project : p
              ),
              currentProject: project,
              isLoading: false
            }));
          }
          return project;
        } catch (error) {
          console.error('Failed to load project:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      createProject: async (projectData) => {
        set({ isLoading: true });
        try {
          const newProject = await createProjectService({
            ...projectData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          set((state) => ({
            projects: [newProject, ...state.projects],
            isLoading: false
          }));
          return newProject;
        } catch (error) {
          console.error('Failed to create project:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      updateProject: async (projectId, updates) => {
        set({ isLoading: true });
        try {
          const updatedProject = await updateProjectService(projectId, {
            ...updates,
            updated_at: new Date().toISOString()
          });
          set((state) => ({
            projects: state.projects.map(project =>
              project.id === projectId ? updatedProject : project
            ),
            isLoading: false
          }));
          return { success: true, project: updatedProject };
        } catch (error) {
          console.error('Failed to update project:', error);
          set({ isLoading: false });
          return { success: false, error: error.message };
        }
      },

      // Local update for UI-only changes (like task deletion)
      updateProjectLocal: (projectId, updates) => {
        set((state) => ({
          projects: state.projects.map(project =>
            project.id === projectId 
              ? { ...project, ...updates, updated_at: new Date().toISOString() }
              : project
          )
        }));
      },

      deleteProject: async (projectId) => {
        set({ isLoading: true });
        try {
          await deleteProjectService(projectId);
          set((state) => ({
            projects: state.projects.filter(project => project.id !== projectId),
            isLoading: false
          }));
        } catch (error) {
          console.error('Failed to delete project:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      setCurrentProject: (project) => {
        set({ currentProject: project });
      },

      setInvoiceDiscountPercentage: (percentage) => {
        set({ invoiceDiscountPercentage: percentage });
      },

      // Update project discount in database
      updateProjectDiscount: async (projectId, discountPercentage) => {
        try {
          const updatedProject = await updateProjectDiscount(projectId, discountPercentage);
          
          // Update local state
          set((state) => ({
            projects: state.projects.map(project =>
              project.id === projectId 
                ? { ...project, discount_percentage: discountPercentage }
                : project
            )
          }));
          
          return { success: true, project: updatedProject };
        } catch (error) {
          console.error('Failed to update project discount:', error);
          return { success: false, error: error.message };
        }
      },

      // Billing Items Management
      addBillingItem: async (projectId, billingItemData) => {
        try {
          console.log('Adding billing item to project:', projectId, billingItemData);
          
          const newBillingItem = await createBillingItemService(projectId, billingItemData);
          
          // Update local state
          set((state) => ({
            projects: state.projects.map((project) =>
              project.id === projectId
                ? {
                    ...project,
                    billingItems: [...(project.billingItems || []), newBillingItem]
                  }
                : project
            )
          }));
          
          console.log('Billing item added successfully:', newBillingItem);
          return { success: true, billingItem: newBillingItem };
        } catch (error) {
          console.error('Failed to add billing item:', error);
          
          // Provide user-friendly error messages
          let errorMessage = 'Failed to add billing item. Please try again.';
          
          if (error.message?.includes('Connection to database failed')) {
            errorMessage = 'Connection to database failed. Please check your internet connection and try again.';
          } else if (error.message?.includes('Authentication failed')) {
            errorMessage = 'Authentication failed. Please log in again.';
          } else if (error.message?.includes('Access denied')) {
            errorMessage = 'Access denied. You may not have permission to create billing items in this project.';
          } else if (error.message?.includes('You must be logged in')) {
            errorMessage = 'You must be logged in to create billing items.';
          }
          
          return { success: false, error: errorMessage };
        }
      },

      updateBillingItem: async (projectId, billingItemId, updates) => {
        try {
          console.log('Updating billing item:', { projectId, billingItemId, updates });
          
          const updatedBillingItem = await updateBillingItemService(billingItemId, updates);
          
          // Update local state
          set((state) => ({
            projects: state.projects.map(project =>
              project.id === projectId
                ? {
                    ...project,
                    billingItems: project.billingItems?.map(item =>
                      item.id === billingItemId ? updatedBillingItem : item
                    ) || []
                  }
                : project
            )
          }));
          
          console.log('Billing item updated successfully:', updatedBillingItem);
          return { success: true, billingItem: updatedBillingItem };
        } catch (error) {
          console.error('Failed to update billing item:', error);
          
          // Provide user-friendly error messages
          let errorMessage = 'Failed to update billing item. Please try again.';
          
          if (error.message?.includes('Connection to database failed')) {
            errorMessage = 'Connection to database failed. Please check your internet connection and try again.';
          } else if (error.message?.includes('Authentication failed')) {
            errorMessage = 'Authentication failed. Please log in again.';
          } else if (error.message?.includes('Access denied')) {
            errorMessage = 'Access denied. You may not have permission to update billing items in this project.';
          } else if (error.message?.includes('You must be logged in')) {
            errorMessage = 'You must be logged in to update billing items.';
          }
          
          return { success: false, error: errorMessage };
        }
      },

      deleteBillingItem: async (projectId, billingItemId) => {
        try {
          console.log('Deleting billing item:', { projectId, billingItemId });
          
          await deleteBillingItemService(billingItemId);
          
          // Update local state
          set((state) => ({
            projects: state.projects.map(project =>
              project.id === projectId
                ? {
                    ...project,
                    billingItems: project.billingItems?.filter(item => item.id !== billingItemId) || []
                  }
                : project
            )
          }));
          
          console.log('Billing item deleted successfully');
          return { success: true };
        } catch (error) {
          console.error('Failed to delete billing item:', error);
          
          // Provide user-friendly error messages
          let errorMessage = 'Failed to delete billing item. Please try again.';
          
          if (error.message?.includes('Connection to database failed')) {
            errorMessage = 'Connection to database failed. Please check your internet connection and try again.';
          } else if (error.message?.includes('Authentication failed')) {
            errorMessage = 'Authentication failed. Please log in again.';
          } else if (error.message?.includes('Access denied')) {
            errorMessage = 'Access denied. You may not have permission to delete billing items in this project.';
          } else if (error.message?.includes('You must be logged in')) {
            errorMessage = 'You must be logged in to delete billing items.';
          }
          
          return { success: false, error: errorMessage };
        }
      },

      // Enhanced Task Management
      addTask: async (projectId, taskData) => {
        try {
          console.log('Adding task to project:', projectId, taskData);
          
          const newTask = await createTaskService(projectId, taskData);
          
          // Update local state
          set((state) => ({
            projects: state.projects.map((project) =>
              project.id === projectId
                ? {
                    ...project,
                    tasks: [...(project.tasks || []), newTask]
                  }
                : project
            )
          }));
          
          console.log('Task added successfully:', newTask);
          return { success: true, task: newTask };
        } catch (error) {
          console.error('Failed to add task:', error);
          
          // Provide user-friendly error messages
          let errorMessage = 'Failed to add task. Please try again.';
          
          if (error.message?.includes('Connection to database failed')) {
            errorMessage = 'Connection to database failed. Please check your internet connection and try again.';
          } else if (error.message?.includes('Authentication failed')) {
            errorMessage = 'Authentication failed. Please log in again.';
          } else if (error.message?.includes('Access denied')) {
            errorMessage = 'Access denied. You may not have permission to create tasks in this project.';
          } else if (error.message?.includes('You must be logged in')) {
            errorMessage = 'You must be logged in to create tasks.';
          }
          
          return { success: false, error: errorMessage };
        }
      },

      updateTask: async (projectId, taskId, updates) => {
        try {
          console.log('Updating task:', { projectId, taskId, updates });
          
          // Map updates to snake_case for database
          const updatesForDB = {
            ...updates,
            assigned_to: updates.assignedTo !== undefined ? updates.assignedTo : undefined,
            billing_item_id: updates.billingItemId !== undefined ? updates.billingItemId : undefined,
            time_spent: updates.timeSpent !== undefined ? updates.timeSpent : undefined
          };
          
          // Remove camelCase properties that shouldn't go to DB
          delete updatesForDB.assignedTo;
          delete updatesForDB.billingItemId;
          delete updatesForDB.timeSpent;
          
          console.log('Updates for database:', updatesForDB);

          const updatedTask = await updateTaskService(taskId, updatesForDB);
          
          // Update local state
          set((state) => ({
            projects: state.projects.map(project =>
              project.id === projectId
                ? {
                    ...project,
                    tasks: (project.tasks || []).map(task =>
                      task.id === taskId ? { ...task, ...updates } : task
                    )
                  }
                : project
            )
          }));
          
          console.log('Task updated successfully:', updatedTask);
          return { success: true, task: updatedTask };
        } catch (error) {
          console.error('Failed to update task:', error);
          
          // Provide user-friendly error messages
          let errorMessage = 'Failed to update task. Please try again.';
          
          if (error.message?.includes('Connection to database failed')) {
            errorMessage = 'Connection to database failed. Please check your internet connection and try again.';
          } else if (error.message?.includes('Authentication failed')) {
            errorMessage = 'Authentication failed. Please log in again.';
          } else if (error.message?.includes('Access denied')) {
            errorMessage = 'Access denied. You may not have permission to update this task. Only task assignees and project admins can update tasks.';
          } else if (error.message?.includes('You must be logged in')) {
            errorMessage = 'You must be logged in to update tasks.';
          }
          
          return { success: false, error: errorMessage };
        }
      },

      deleteTask: async (taskId) => {
        set({ isLoading: true });
        try {
          await deleteTaskService(taskId);
          set({ isLoading: false });
        } catch (error) {
          console.error('Failed to delete task:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      assignTask: (projectId, taskId, userId) => {
        set((state) => ({
          projects: state.projects.map(project =>
            project.id === projectId
              ? {
                  ...project,
                  tasks: (project.tasks || []).map(task =>
                    task.id === taskId ? { ...task, assignedTo: userId } : task
                  )
                }
              : project
          )
        }));
      },

      // Enhanced Issue Management with Approval Workflow
      addIssue: async (projectId, issueData) => {
        set({ isLoading: true });
        try {
          // Prepare issue data for database (map to snake_case where needed)
          const issueDataForDB = {
            title: issueData.title,
            description: issueData.description,
            status: issueData.status || 'open',
            priority: issueData.priority || 'medium',
            type: issueData.type || 'general',
            assigned_to: issueData.assignedTo || null,
            reported_by: issueData.reportedBy || null,
            task_id: issueData.taskId || null
          };

          const createdIssue = await createIssueService(projectId, issueDataForDB);
          
          // Add the created issue to local state
          set((state) => ({
            projects: state.projects.map(project =>
              project.id === projectId
                ? { ...project, issues: [...(project.issues || []), createdIssue] }
                : project
            )
          }));
          set({ isLoading: false });
          return { success: true, issue: createdIssue };
        } catch (error) {
          console.error('Failed to add issue:', error);
          set({ isLoading: false });
          
          // Provide user-friendly error messages
          let errorMessage = 'Failed to add issue. Please try again.';
          
          if (error.message?.includes('Connection to database failed')) {
            errorMessage = 'Connection to database failed. Please check your internet connection and try again.';
          } else if (error.message?.includes('Authentication failed')) {
            errorMessage = 'Authentication failed. Please log in again.';
          } else if (error.message?.includes('Access denied')) {
            errorMessage = 'Access denied. You may not have permission to create issues in this project.';
          } else if (error.message?.includes('You must be logged in')) {
            errorMessage = 'You must be logged in to create issues.';
          } else if (error.message?.includes('violates not-null constraint')) {
            errorMessage = 'Please fill in all required fields.';
          } else if (error.message?.includes('violates foreign key constraint')) {
            errorMessage = 'Invalid project or task reference. Please try again.';
          }
          
          return { success: false, error: errorMessage };
        }
      },

      updateIssue: async (projectId, issueId, updates) => {
        set({ isLoading: true });
        try {
          // Map updates to snake_case for database
          const updatesForDB = {
            ...updates,
            assigned_to: updates.assignedTo !== undefined ? updates.assignedTo : undefined,
            reported_by: updates.reportedBy !== undefined ? updates.reportedBy : undefined,
            task_id: updates.taskId !== undefined ? updates.taskId : undefined
          };
          
          // Remove camelCase properties that shouldn't go to DB
          delete updatesForDB.assignedTo;
          delete updatesForDB.reportedBy;
          delete updatesForDB.taskId;

          await updateIssueService(issueId, updatesForDB);
          set((state) => ({
            projects: state.projects.map(project =>
              project.id === projectId
                ? {
                    ...project,
                    issues: (project.issues || []).map(issue =>
                      issue.id === issueId ? { ...issue, ...updates } : issue
                    )
                  }
                : project
            )
          }));
          set({ isLoading: false });
        } catch (error) {
          console.error('Failed to update issue:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      deleteIssue: async (issueId) => {
        set({ isLoading: true });
        try {
          await deleteIssueService(issueId);
          set({ isLoading: false });
        } catch (error) {
          console.error('Failed to delete issue:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      approveIssue: (projectId, issueId) => {
        set((state) => ({
          projects: state.projects.map(project =>
            project.id === projectId
              ? {
                  ...project,
                  issues: (project.issues || []).map(issue =>
                    issue.id === issueId 
                      ? { 
                          ...issue, 
                          status: 'approved',
                          approvedAt: new Date().toISOString()
                        } 
                      : issue
                  )
                }
              : project
          )
        }));
      },

      rejectIssue: (projectId, issueId, reason) => {
        set((state) => ({
          projects: state.projects.map(project =>
            project.id === projectId
              ? {
                  ...project,
                  issues: (project.issues || []).map(issue =>
                    issue.id === issueId 
                      ? { 
                          ...issue, 
                          status: 'rejected',
                          rejectionReason: reason,
                          rejectedAt: new Date().toISOString()
                        } 
                      : issue
                  )
                }
              : project
          )
        }));
      },



      // Getters
      getProjectById: (projectId) => {
        const { projects } = get();
        const project = projects.find(project => project.id === projectId);
        
        // Return project with default arrays for missing properties
        if (project) {
          return {
            ...project,
            team: project.team || [],
            tasks: project.tasks || [],
            issues: project.issues || [],
            billingItems: project.billingItems || [],
            taskGroups: project.taskGroups || []
          };
        }
        
        return null;
      },

      getProjectsByStatus: (status) => {
        const { projects } = get();
        return projects.filter(project => project.status === status);
      },

      getProjectsByType: (type) => {
        const { projects } = get();
        return projects.filter(project => project.type === type);
      },

      getProjectsByUser: (userId) => {
        const { projects } = get();
        return projects.filter(project => project.team?.includes(userId) || false);
      },

      getProjectBillingTotal: (projectId) => {
        const project = get().getProjectById(projectId);
        if (!project || !project.billingItems) return 0;
        return project.billingItems.reduce((total, item) => total + (item.totalPrice || 0), 0);
      },

      getProjectSpentTotal: (projectId) => {
        const project = get().getProjectById(projectId);
        if (!project || !project.billingItems) return 0;
        return project.billingItems
          .filter(item => item.status === 'completed')
          .reduce((total, item) => total + (item.totalPrice || 0), 0);
      },

      getProjectRemainingTotal: (projectId) => {
        const project = get().getProjectById(projectId);
        if (!project || !project.billingItems) return 0;
        return project.billingItems
          .filter(item => item.status === 'pending' || item.status === 'in-progress')
          .reduce((total, item) => total + (item.totalPrice || 0), 0);
      },

      getTasksByUser: (userId) => {
        const { projects } = get();
        const allTasks = [];
        projects.forEach(project => {
          if (project.tasks) {
            project.tasks.forEach(task => {
              if (task.assignedTo === userId) {
                allTasks.push({ ...task, projectId: project.id, projectName: project.name });
              }
            });
          }
        });
        return allTasks;
      },

      getIssuesByUser: (userId) => {
        const { projects } = get();
        const allIssues = [];
        projects.forEach(project => {
          if (project.issues) {
            project.issues.forEach(issue => {
              if (issue.assignedTo === userId || issue.reportedBy === userId) {
                allIssues.push({ ...issue, projectId: project.id, projectName: project.name });
              }
            });
          }
        });
        return allIssues;
      },

      // Company Management Functions
      loadCompanies: async () => {
        set({ isLoading: true });
        try {
          const companies = await fetchCompanies();
          set({ companies, isLoading: false });
        } catch (error) {
          console.error('Failed to load companies:', error);
          set({ isLoading: false });
        }
      },

      addCompany: async (companyData) => {
        set({ isLoading: true });
        try {
          const newCompany = await createCompanyService({
            ...companyData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          set((state) => ({
            companies: [newCompany, ...state.companies],
            isLoading: false
          }));
          return newCompany;
        } catch (error) {
          console.error('Failed to create company:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      updateCompany: async (companyId, updates) => {
        set({ isLoading: true });
        try {
          const updatedCompany = await updateCompanyService(companyId, {
            ...updates,
            updated_at: new Date().toISOString()
          });
          set((state) => ({
            companies: state.companies.map(company =>
              company.id === companyId ? updatedCompany : company
            ),
            isLoading: false
          }));
          return updatedCompany;
        } catch (error) {
          console.error('Failed to update company:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      deleteCompany: async (companyId) => {
        set({ isLoading: true });
        try {
          await deleteCompanyService(companyId);
          set((state) => ({
            companies: state.companies.filter(company => company.id !== companyId),
            isLoading: false
          }));
        } catch (error) {
          console.error('Failed to delete company:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      getCompanyById: (companyId) => {
        const { companies } = get();
        return companies.find(company => company.id === companyId);
      },

      getProjectsByCompany: (companyId) => {
        const { projects } = get();
        return projects.filter(project => project.company_id === companyId);
      },

      getCompanyRevenue: (companyId) => {
        const { projects } = get();
        const companyProjects = projects.filter(project => project.company_id === companyId);
        return companyProjects.reduce((sum, project) => sum + get().getProjectBillingTotal(project.id), 0);
      },

      getCompanyCompletedRevenue: (companyId) => {
        const { projects } = get();
        const companyProjects = projects.filter(project => project.company_id === companyId);
        return companyProjects.reduce((sum, project) => sum + get().getProjectSpentTotal(project.id), 0);
      },

      // Mark project as paid
      markProjectAsPaid: async (projectId) => {
        set({ isLoading: true });
        try {
          await markProjectAsPaid(projectId);
          set((state) => ({
            projects: state.projects.map(project =>
              project.id === projectId ? { ...project, paid: true } : project
            ),
            isLoading: false
          }));
        } catch (error) {
          console.error('Failed to mark project as paid:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      // Mark project as unpaid
      markProjectAsUnpaid: async (projectId) => {
        set({ isLoading: true });
        try {
          await markProjectAsUnpaid(projectId);
          set((state) => ({
            projects: state.projects.map(project =>
              project.id === projectId ? { ...project, paid: false } : project
            ),
            isLoading: false
          }));
        } catch (error) {
          console.error('Failed to mark project as unpaid:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      // Fetch company data by ID and update project data
      fetchCompanyAndUpdateProject: async (projectId) => {
        try {
          const project = get().getProjectById(projectId);
          if (!project) {
            console.error('Project not found for company update:', projectId);
            return { success: false, error: 'Project not found' };
          }

          const companyId = project.company_id;
          if (!companyId) {
            console.warn('Project has no company_id, cannot fetch company:', projectId);
            return { success: false, error: 'Project has no company assigned' };
          }

          const company = await fetchCompanyById(companyId);
          if (company) {
            set((state) => ({
              projects: state.projects.map(p =>
                p.id === projectId ? { ...p, company: company } : p
              )
            }));
            return { success: true, company };
          } else {
            console.error('Failed to fetch company by ID:', companyId);
            return { success: false, error: 'Failed to fetch company' };
          }
        } catch (error) {
          console.error('Failed to fetch company and update project:', error);
          return { success: false, error: error.message };
        }
      },

      // Task Groups Management
      addTaskGroup: async (projectId, groupData) => {
        try {
          console.log('Adding task group to project:', projectId, groupData);
          
          const newTaskGroup = await createTaskGroupService(projectId, groupData);
          
          // Update local state
          set((state) => ({
            projects: state.projects.map((project) =>
              project.id === projectId
                ? {
                    ...project,
                    taskGroups: [...(project.taskGroups || []), newTaskGroup]
                  }
                : project
            )
          }));
          
          console.log('Task group added successfully:', newTaskGroup);
          return { success: true, taskGroup: newTaskGroup };
        } catch (error) {
          console.error('Failed to add task group:', error);
          
          // Provide user-friendly error messages
          let errorMessage = 'Failed to add task group. Please try again.';
          
          if (error.message?.includes('Connection to database failed')) {
            errorMessage = 'Connection to database failed. Please check your internet connection and try again.';
          } else if (error.message?.includes('Authentication failed')) {
            errorMessage = 'Authentication failed. Please log in again.';
          } else if (error.message?.includes('Access denied')) {
            errorMessage = 'Access denied. You may not have permission to create task groups in this project.';
          } else if (error.message?.includes('You must be logged in')) {
            errorMessage = 'You must be logged in to create task groups.';
          }
          
          return { success: false, error: errorMessage };
        }
      },

      updateTaskGroup: async (projectId, groupId, updates) => {
        try {
          console.log('Updating task group:', { projectId, groupId, updates });
          
          const updatedTaskGroup = await updateTaskGroupService(groupId, updates);
          
          // Update local state
          set((state) => ({
            projects: state.projects.map(project =>
              project.id === projectId
                ? {
                    ...project,
                    taskGroups: project.taskGroups?.map(group =>
                      group.id === groupId ? updatedTaskGroup : group
                    ) || []
                  }
                : project
            )
          }));
          
          console.log('Task group updated successfully:', updatedTaskGroup);
          return { success: true, taskGroup: updatedTaskGroup };
        } catch (error) {
          console.error('Failed to update task group:', error);
          
          // Provide user-friendly error messages
          let errorMessage = 'Failed to update task group. Please try again.';
          
          if (error.message?.includes('Connection to database failed')) {
            errorMessage = 'Connection to database failed. Please check your internet connection and try again.';
          } else if (error.message?.includes('Authentication failed')) {
            errorMessage = 'Authentication failed. Please log in again.';
          } else if (error.message?.includes('Access denied')) {
            errorMessage = 'Access denied. You may not have permission to update task groups in this project.';
          } else if (error.message?.includes('You must be logged in')) {
            errorMessage = 'You must be logged in to update task groups.';
          }
          
          return { success: false, error: errorMessage };
        }
      },

      deleteTaskGroup: async (projectId, groupId) => {
        try {
          console.log('Deleting task group:', { projectId, groupId });
          
          await deleteTaskGroupService(groupId);
          
          // Update local state
          set((state) => ({
            projects: state.projects.map(project =>
              project.id === projectId
                ? {
                    ...project,
                    taskGroups: project.taskGroups?.filter(group => group.id !== groupId) || []
                  }
                : project
            )
          }));
          
          console.log('Task group deleted successfully');
          return { success: true };
        } catch (error) {
          console.error('Failed to delete task group:', error);
          
          // Provide user-friendly error messages
          let errorMessage = 'Failed to delete task group. Please try again.';
          
          if (error.message?.includes('Connection to database failed')) {
            errorMessage = 'Connection to database failed. Please check your internet connection and try again.';
          } else if (error.message?.includes('Authentication failed')) {
            errorMessage = 'Authentication failed. Please log in again.';
          } else if (error.message?.includes('Access denied')) {
            errorMessage = 'Access denied. You may not have permission to delete task groups in this project.';
          } else if (error.message?.includes('You must be logged in')) {
            errorMessage = 'You must be logged in to delete task groups.';
          }
          
          return { success: false, error: errorMessage };
        }
      },

      loadTaskGroups: async (projectId) => {
        try {
          const taskGroups = await fetchTaskGroups(projectId);
          
          // Update local state
          set((state) => ({
            projects: state.projects.map(project =>
              project.id === projectId
                ? { ...project, taskGroups: taskGroups }
                : project
            )
          }));
          
          return taskGroups;
        } catch (error) {
          console.error('Failed to load task groups:', error);
          throw error;
        }
      },

      // Advance Payment Management
      updateProjectAdvance: async (projectId, advanceData) => {
        try {
          console.log('Updating project advance payment:', { projectId, advanceData });
          
          const updatedProject = await updateProjectAdvance(projectId, advanceData);
          
          // Update local state
          set((state) => ({
            projects: state.projects.map(project =>
              project.id === projectId
                ? { 
                    ...project, 
                    advanceAmount: advanceData.advanceAmount || 0,
                    advancePaymentDate: advanceData.advancePaymentDate,
                    advancePaymentMethod: advanceData.advancePaymentMethod || 'cash',
                    advanceNotes: advanceData.advanceNotes
                  }
                : project
            )
          }));
          
          console.log('Project advance payment updated successfully:', updatedProject);
          return { success: true, project: updatedProject };
        } catch (error) {
          console.error('Failed to update project advance payment:', error);
          
          // Provide user-friendly error messages
          let errorMessage = 'Failed to update advance payment. Please try again.';
          
          if (error.message?.includes('Connection to database failed')) {
            errorMessage = 'Connection to database failed. Please check your internet connection and try again.';
          } else if (error.message?.includes('Authentication failed')) {
            errorMessage = 'Authentication failed. Please log in again.';
          } else if (error.message?.includes('Access denied')) {
            errorMessage = 'Access denied. You may not have permission to update advance payments for this project.';
          } else if (error.message?.includes('You must be logged in')) {
            errorMessage = 'You must be logged in to update advance payments.';
          }
          
          return { success: false, error: errorMessage };
        }
      },

      getProjectAdvance: async (projectId) => {
        try {
          const advanceData = await getProjectAdvance(projectId);
          return advanceData;
        } catch (error) {
          console.error('Failed to get project advance payment:', error);
          return {
            advanceAmount: 0,
            advancePaymentDate: null,
            advancePaymentMethod: 'cash',
            advanceNotes: null
          };
        }
      }
    }),
    {
      name: 'project-storage',
      partialize: (state) => ({ projects: state.projects, companies: state.companies })
    }
  )
);

export { useProjectStore }; 