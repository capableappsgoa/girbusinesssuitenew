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
import { notify, pushViaServer } from '../services/notificationService';

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
          notify({ title: 'Projects Loaded', body: `Loaded ${projects.length} project(s)` });
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
          notify({ title: 'Project Created', body: `${newProject.name} created successfully` });
          pushViaServer({ title: 'Project Created', body: `${newProject.name} created`, data: { url: `/projects/${newProject.id}` } });
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
          notify({ title: 'Project Updated', body: `${updatedProject.name} updated successfully` });
          pushViaServer({ title: 'Project Updated', body: `${updatedProject.name} updated`, data: { url: `/projects/${updatedProject.id}` } });
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
          notify({ title: 'Project Deleted', body: `Project removed successfully` });
          pushViaServer({ title: 'Project Deleted', body: `A project was removed` });
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
          
          notify({ title: 'Discount Updated', body: `Project discount set to ${discountPercentage}%` });
          pushViaServer({ title: 'Discount Updated', body: `Discount set to ${discountPercentage}%` });
          return { success: true, project: updatedProject };
        } catch (error) {
          console.error('Failed to update project discount:', error);
          return { success: false, error: error.message };
        }
      },

      // Billing Items Management
      addBillingItem: async (projectId, billingItemData) => {
        try {
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
          
          notify({ title: 'Billing Item Added', body: `${newBillingItem.name || 'Item'} added` });
          pushViaServer({ title: 'Billing Item Added', body: `${newBillingItem.name || 'Item'} added`, data: { url: `/projects/${projectId}` } });
          return { success: true, billingItem: newBillingItem };
        } catch (error) {
          return { success: false, error: 'Failed to add billing item. Please try again.' };
        }
      },

      updateBillingItem: async (projectId, billingItemId, updates) => {
        try {
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
          
          notify({ title: 'Billing Item Updated', body: `${updatedBillingItem.name || 'Item'} updated` });
          pushViaServer({ title: 'Billing Item Updated', body: `${updatedBillingItem.name || 'Item'} updated`, data: { url: `/projects/${projectId}` } });
          return { success: true, billingItem: updatedBillingItem };
        } catch (error) {
          return { success: false, error: 'Failed to update billing item. Please try again.' };
        }
      },

      deleteBillingItem: async (projectId, billingItemId) => {
        try {
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
          
          notify({ title: 'Billing Item Deleted', body: `Item deleted successfully` });
          pushViaServer({ title: 'Billing Item Deleted', body: `Item deleted`, data: { url: `/projects/${projectId}` } });
          return { success: true };
        } catch (error) {
          return { success: false, error: 'Failed to delete billing item. Please try again.' };
        }
      },

      // Enhanced Task Management
      addTask: async (projectId, taskData) => {
        try {
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
          
          notify({ title: 'Task Created', body: `${newTask.title || 'Task'} added` });
          pushViaServer({ title: 'Task Created', body: `${newTask.title || 'Task'} added`, data: { url: `/projects/${projectId}?tab=tasks` } });
          return { success: true, task: newTask };
        } catch (error) {
          return { success: false, error: 'Failed to add task. Please try again.' };
        }
      },

      updateTask: async (projectId, taskId, updates) => {
        try {
          const updatedTask = await updateTaskService(taskId, updates);
          
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
          
          notify({ title: 'Task Updated', body: `${updatedTask.title || 'Task'} updated` });
          pushViaServer({ title: 'Task Updated', body: `${updatedTask.title || 'Task'} updated`, data: { url: `/projects/${projectId}?tab=tasks` } });
          return { success: true, task: updatedTask };
        } catch (error) {
          return { success: false, error: 'Failed to update task. Please try again.' };
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
          notify({ title: 'Issue Reported', body: `${createdIssue.title || 'Issue'} created` });
          pushViaServer({ title: 'Issue Reported', body: `${createdIssue.title || 'Issue'} created`, data: { url: `/projects/${projectId}?tab=issues` } });
          return { success: true, issue: createdIssue };
        } catch (error) {
          set({ isLoading: false });
          return { success: false, error: 'Failed to add issue. Please try again.' };
        }
      },

      updateIssue: async (projectId, issueId, updates) => {
        set({ isLoading: true });
        try {
          const updatesForDB = {
            ...updates,
            assigned_to: updates.assignedTo !== undefined ? updates.assignedTo : undefined,
            reported_by: updates.reportedBy !== undefined ? updates.reportedBy : undefined,
            task_id: updates.taskId !== undefined ? updates.taskId : undefined
          };
          
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
          notify({ title: 'Issue Updated', body: `Issue updated successfully` });
          pushViaServer({ title: 'Issue Updated', body: `Issue updated`, data: { url: `/projects/${projectId}?tab=issues` } });
        } catch (error) {
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
        const billingTotal = project.billingItems.reduce((total, item) => total + (item.totalPrice || 0), 0);
        const advanceAmount = project.advanceAmount || 0;
        return billingTotal - advanceAmount;
      },

      getProjectSpentTotal: (projectId) => {
        const project = get().getProjectById(projectId);
        if (!project || !project.billingItems) return 0;
        const spentTotal = project.billingItems
          .filter(item => item.status === 'completed')
          .reduce((total, item) => total + (item.totalPrice || 0), 0);
        const advanceAmount = project.advanceAmount || 0;
        return Math.max(0, spentTotal - advanceAmount);
      },

      getProjectRemainingTotal: (projectId) => {
        const project = get().getProjectById(projectId);
        if (!project || !project.billingItems) return 0;
        const remainingTotal = project.billingItems
          .filter(item => item.status === 'pending' || item.status === 'in-progress')
          .reduce((total, item) => total + (item.totalPrice || 0), 0);
        const advanceAmount = project.advanceAmount || 0;
        const completedTotal = project.billingItems
          .filter(item => item.status === 'completed')
          .reduce((total, item) => total + (item.totalPrice || 0), 0);
        const excessAdvance = Math.max(0, advanceAmount - completedTotal);
        return Math.max(0, remainingTotal - excessAdvance);
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

      // Mark project as paid/unpaid
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
          notify({ title: 'Payment Received', body: 'Project marked as paid' });
          pushViaServer({ title: 'Payment Received', body: 'Project marked as paid', data: { url: `/projects/${projectId}` } });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

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
          notify({ title: 'Payment Reverted', body: 'Project marked as unpaid' });
          pushViaServer({ title: 'Payment Reverted', body: 'Project marked as unpaid', data: { url: `/projects/${projectId}` } });
        } catch (error) {
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
          
          notify({ title: 'Task Group Added', body: `${newTaskGroup.name || 'Group'} added` });
          return { success: true, taskGroup: newTaskGroup };
        } catch (error) {
          return { success: false, error: 'Failed to add task group. Please try again.' };
        }
      },

      updateTaskGroup: async (projectId, groupId, updates) => {
        try {
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
          
          notify({ title: 'Task Group Updated', body: `${updatedTaskGroup.name || 'Group'} updated` });
          return { success: true, taskGroup: updatedTaskGroup };
        } catch (error) {
          return { success: false, error: 'Failed to update task group. Please try again.' };
        }
      },

      deleteTaskGroup: async (projectId, groupId) => {
        try {
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
          
          notify({ title: 'Task Group Deleted', body: `Group deleted successfully` });
          return { success: true };
        } catch (error) {
          return { success: false, error: 'Failed to delete task group. Please try again.' };
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
          
          notify({ title: 'Advance Updated', body: `Advance set to ₹${(advanceData.advanceAmount || 0).toLocaleString()}` });
          pushViaServer({ title: 'Advance Updated', body: `Advance set to ₹${(advanceData.advanceAmount || 0).toLocaleString()}`, data: { url: `/projects/${projectId}?tab=invoice` } });
          return { success: true, project: updatedProject };
        } catch (error) {
          return { success: false, error: 'Failed to update advance payment. Please try again.' };
        }
      },

      getProjectAdvance: async (projectId) => {
        try {
          const advanceData = await getProjectAdvance(projectId);
          return advanceData;
        } catch (error) {
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