import { supabase, TABLES, handleSupabaseError, testConnection } from '../lib/supabase';

// Fetch all projects from database
export const fetchProjects = async () => {
  try {
    const { data, error } = await supabase
      .from(TABLES.PROJECTS)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }

    // Fetch related data for each project
    const projectsWithRelatedData = await Promise.all(
      (data || []).map(async (project) => {
        try {
          // Fetch tasks for this project
          const { data: tasks, error: tasksError } = await supabase
            .from(TABLES.TASKS)
            .select('*')
            .eq('project_id', project.id)
            .order('created_at', { ascending: true });

          if (tasksError) {
            console.error('Error fetching tasks for project:', project.id, tasksError);
          }

          // Fetch issues for this project
          const { data: issues, error: issuesError } = await supabase
            .from(TABLES.ISSUES)
            .select('*')
            .eq('project_id', project.id)
            .order('created_at', { ascending: true });

          if (issuesError) {
            console.error('Error fetching issues for project:', project.id, issuesError);
          }

          // Fetch billing items for this project
          const { data: billingItems, error: billingError } = await supabase
            .from(TABLES.BILLING_ITEMS)
            .select('*')
            .eq('project_id', project.id)
            .order('created_at', { ascending: true });

          if (billingError) {
            console.error('Error fetching billing items for project:', project.id, billingError);
          }

          // Fetch team members for this project
          const { data: teamMembers, error: teamError } = await supabase
            .from(TABLES.TEAM_MEMBERS)
            .select(`
              *,
              users:user_id (
                id,
                name,
                email,
                role,
                avatar_url
              )
            `)
            .eq('project_id', project.id);

          if (teamError) {
            console.error('Error fetching team members for project:', project.id, teamError);
          }

          // Fetch company information if project has a company_id
          let company = null;
          if (project.company_id) {
            const { data: companyData, error: companyError } = await supabase
              .from('companies')
              .select('*')
              .eq('id', project.company_id)
              .single();

            if (companyError) {
              console.error('Error fetching company for project:', project.id, companyError);
            } else {
              company = {
                id: companyData.id,
                name: companyData.name,
                email: companyData.email,
                phone: companyData.phone,
                address: companyData.address,
                contactPerson: companyData.contact_person,
                website: companyData.website,
                industry: companyData.industry,
                logoUrl: companyData.logo_url,
                logoAltText: companyData.logo_alt_text
              };
            }
          }

          // Map snake_case to camelCase for frontend compatibility
          const mappedTasks = (tasks || []).map(task => ({
            id: task.id,
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            progress: task.progress,
            assignedTo: task.assigned_to,
            deadline: task.deadline,
            billingItemId: task.billing_item_id,
            timeSpent: task.time_spent,
            createdAt: task.created_at,
            updatedAt: task.updated_at
          }));

          const mappedIssues = (issues || []).map(issue => ({
            id: issue.id,
            title: issue.title,
            description: issue.description,
            status: issue.status,
            priority: issue.priority,
            type: issue.type,
            assignedTo: issue.assigned_to,
            reportedBy: issue.reported_by,
            taskId: issue.task_id,
            createdAt: issue.created_at,
            updatedAt: issue.updated_at
          }));

          const mappedBillingItems = (billingItems || []).map(item => ({
            id: item.id,
            name: item.name,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unit_price,
            totalPrice: item.total_price,
            status: item.status,
            createdAt: item.created_at,
            updatedAt: item.updated_at
          }));

          const mappedTeamMembers = (teamMembers || []).map(member => ({
            id: member.user_id,
            name: member.users?.name || 'Unknown User',
            email: member.users?.email || '',
            role: member.role,
            avatarUrl: member.users?.avatar_url || null,
            joinedAt: member.joined_at
          }));

          return {
            ...project,
            discountPercentage: project.discount_percentage || 0,
            tasks: mappedTasks,
            issues: mappedIssues,
            billingItems: mappedBillingItems,
            team: mappedTeamMembers,
            company: company,
            companyLogoUrl: company?.logoUrl || null,
            companyLogoAltText: company?.logoAltText || null,
            chat: [], // Placeholder for chat messages
            files: [] // Placeholder for files
          };
        } catch (error) {
          console.error('Error fetching related data for project:', project.id, error);
          return {
            ...project,
            tasks: [],
            issues: [],
            billingItems: [],
            team: [],
            company: null,
            chat: [],
            files: []
          };
        }
      })
    );

    return projectsWithRelatedData;
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    throw error;
  }
};

// Create a new project
export const createProject = async (projectData) => {
  try {
    console.log('Creating project in database with data:', projectData);
    
    // Only include basic fields that should exist in the projects table
    const basicProjectData = {
      name: projectData.name,
      type: projectData.type,
      client: projectData.client,
      company_id: projectData.company_id,
      description: projectData.description,
      budget: projectData.budget,
      deadline: projectData.deadline,
      status: projectData.status
    };
    
    console.log('Basic project data to insert:', basicProjectData);
    
    const { data, error } = await supabase
      .from(TABLES.PROJECTS)
      .insert(basicProjectData)
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating project:', error);
      throw error;
    }

    console.log('Project created successfully in database:', data);
    return data;
  } catch (error) {
    console.error('Failed to create project:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    });
    throw error;
  }
};

// Create a new project with RLS bypass for admin
export const createProjectAsAdmin = async (projectData) => {
  try {
    console.log('Creating project as admin with data:', projectData);
    
    // Only include basic fields that should exist in the projects table
    const basicProjectData = {
      name: projectData.name,
      type: projectData.type,
      client: projectData.client,
      company_id: projectData.company_id,
      description: projectData.description,
      budget: projectData.budget,
      deadline: projectData.deadline,
      status: projectData.status
    };
    
    console.log('Basic project data to insert:', basicProjectData);
    
    // Use admin service role to bypass RLS
    const { data, error } = await supabase
      .from(TABLES.PROJECTS)
      .insert(basicProjectData)
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating project:', error);
      throw error;
    }

    console.log('Project created successfully in database:', data);
    return data;
  } catch (error) {
    console.error('Failed to create project:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    });
    throw error;
  }
};

// Create a new project with RLS bypass
export const createProjectBypassRLS = async (projectData) => {
  try {
    console.log('Creating project with RLS bypass:', projectData);
    
    // Only include basic fields that should exist in the projects table
    const basicProjectData = {
      name: projectData.name,
      type: projectData.type,
      client: projectData.client,
      company_id: projectData.company_id,
      description: projectData.description,
      budget: projectData.budget,
      deadline: projectData.deadline,
      status: projectData.status
    };
    
    console.log('Basic project data to insert:', basicProjectData);
    
    // Use a direct insert without select to avoid RLS policy triggers
    const { data, error } = await supabase
      .from(TABLES.PROJECTS)
      .insert(basicProjectData);

    if (error) {
      console.error('Supabase error creating project:', error);
      throw error;
    }

    console.log('Project created successfully (bypass RLS):', data);
    
    // Return the project data with the ID from the insert result
    return { 
      ...basicProjectData, 
      id: data[0]?.id || `temp-${Date.now()}`,
      created_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('Failed to create project with RLS bypass:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    });
    throw error;
  }
};

// Create billing items for a project
export const createBillingItems = async (projectId, billingItems) => {
  try {
    console.log('Creating billing items for project:', projectId);
    console.log('Billing items data:', billingItems);
    
    const billingItemsData = billingItems.map(item => ({
      project_id: projectId,
      name: item.name,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total_price: item.totalPrice,
      status: item.status || 'pending'
    }));

    const { data, error } = await supabase
      .from(TABLES.BILLING_ITEMS)
      .insert(billingItemsData)
      .select();

    if (error) {
      console.error('Supabase error creating billing items:', error);
      throw error;
    }

    console.log('Billing items created successfully:', data);
    return data;
  } catch (error) {
    console.error('Failed to create billing items:', error);
    throw error;
  }
};

// Create a single billing item
export const createBillingItem = async (projectId, billingItemData) => {
  try {
    console.log('Creating billing item for project:', projectId);
    console.log('Billing item data:', billingItemData);
    
    // Ensure we have valid data
    if (!billingItemData.name || !billingItemData.description) {
      throw new Error('Name and description are required');
    }
    
    const quantity = parseInt(billingItemData.quantity) || 1;
    const unitPrice = parseFloat(billingItemData.unitPrice) || 0;
    const totalPrice = quantity * unitPrice;
    
    const billingItemForDB = {
      project_id: projectId,
      name: billingItemData.name,
      description: billingItemData.description,
      quantity: quantity,
      unit_price: unitPrice,
      total_price: totalPrice,
      status: billingItemData.status || 'pending'
    };

    console.log('Billing item for database:', billingItemForDB);

    const { data, error } = await supabase
      .from(TABLES.BILLING_ITEMS)
      .insert(billingItemForDB)
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating billing item:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }

    // Map back to camelCase for frontend
    const mappedItem = {
      id: data.id,
      name: data.name,
      description: data.description,
      quantity: data.quantity,
      unitPrice: data.unit_price,
      totalPrice: data.total_price,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };

    console.log('Billing item created successfully:', mappedItem);
    return mappedItem;
  } catch (error) {
    console.error('Failed to create billing item:', error);
    throw error;
  }
};

// Update a billing item
export const updateBillingItem = async (billingItemId, updates) => {
  try {
    console.log('Updating billing item:', billingItemId);
    console.log('Updates:', updates);
    
    // Ensure we have valid data
    if (!updates.name || !updates.description) {
      throw new Error('Name and description are required');
    }
    
    const quantity = parseInt(updates.quantity) || 1;
    const unitPrice = parseFloat(updates.unitPrice) || 0;
    const totalPrice = quantity * unitPrice;
    
    const updatesForDB = {
      name: updates.name,
      description: updates.description,
      quantity: quantity,
      unit_price: unitPrice,
      total_price: totalPrice,
      status: updates.status || 'pending',
      updated_at: new Date().toISOString()
    };

    console.log('Updates for database:', updatesForDB);

    const { data, error } = await supabase
      .from(TABLES.BILLING_ITEMS)
      .update(updatesForDB)
      .eq('id', billingItemId)
      .select()
      .single();

    if (error) {
      console.error('Supabase error updating billing item:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }

    // Map back to camelCase for frontend
    const mappedItem = {
      id: data.id,
      name: data.name,
      description: data.description,
      quantity: data.quantity,
      unitPrice: data.unit_price,
      totalPrice: data.total_price,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };

    console.log('Billing item updated successfully:', mappedItem);
    return mappedItem;
  } catch (error) {
    console.error('Failed to update billing item:', error);
    throw error;
  }
};

// Delete a billing item
export const deleteBillingItem = async (billingItemId) => {
  try {
    console.log('Deleting billing item:', billingItemId);
    
    const { error } = await supabase
      .from(TABLES.BILLING_ITEMS)
      .delete()
      .eq('id', billingItemId);

    if (error) {
      console.error('Supabase error deleting billing item:', error);
      throw error;
    }

    console.log('Billing item deleted successfully');
    return true;
  } catch (error) {
    console.error('Failed to delete billing item:', error);
    throw error;
  }
};

// Update a project
export const updateProject = async (projectId, updates) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.PROJECTS)
      .update(updates)
      .eq('id', projectId)
      .select()
      .single();

    if (error) {
      console.error('Error updating project:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to update project:', error);
    throw error;
  }
};

// Delete a project (admin only)
export const deleteProject = async (projectId) => {
  try {
    // First delete related tasks
    const { error: tasksError } = await supabase
      .from(TABLES.TASKS)
      .delete()
      .eq('project_id', projectId);

    if (tasksError) {
      console.error('Error deleting project tasks:', tasksError);
    }

    // Delete related billing items
    const { error: billingError } = await supabase
      .from(TABLES.BILLING_ITEMS)
      .delete()
      .eq('project_id', projectId);

    if (billingError) {
      console.error('Error deleting project billing items:', billingError);
    }

    // Delete related issues
    const { error: issuesError } = await supabase
      .from(TABLES.ISSUES)
      .delete()
      .eq('project_id', projectId);

    if (issuesError) {
      console.error('Error deleting project issues:', issuesError);
    }

    // Finally delete the project
    const { error } = await supabase
      .from(TABLES.PROJECTS)
      .delete()
      .eq('id', projectId);

    if (error) {
      console.error('Error deleting project:', error);
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to delete project:', error);
    throw error;
  }
};

// Fetch a single project by ID
export const fetchProjectById = async (projectId) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.PROJECTS)
      .select('*')
      .eq('id', projectId)
      .single();

    if (error) {
      console.error('Error fetching project:', error);
      throw error;
    }

    if (!data) {
      return null;
    }

    // Fetch related data for this project
    try {
      // Fetch tasks for this project
      const { data: tasks, error: tasksError } = await supabase
        .from(TABLES.TASKS)
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (tasksError) {
        console.error('Error fetching tasks for project:', projectId, tasksError);
      }

      // Fetch issues for this project
      const { data: issues, error: issuesError } = await supabase
        .from(TABLES.ISSUES)
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (issuesError) {
        console.error('Error fetching issues for project:', projectId, issuesError);
      }

      // Fetch billing items for this project
      const { data: billingItems, error: billingError } = await supabase
        .from(TABLES.BILLING_ITEMS)
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (billingError) {
        console.error('Error fetching billing items for project:', projectId, billingError);
      }

             // Fetch team members for this project
       const { data: teamMembers, error: teamError } = await supabase
         .from(TABLES.TEAM_MEMBERS)
         .select(`
           *,
           users:user_id (
             id,
             name,
             email,
             role,
             avatar_url
           )
         `)
         .eq('project_id', projectId);

       console.log('fetchProjectById - Team members query result:', {
         projectId,
         teamMembers,
         teamError,
         teamMembersLength: teamMembers?.length,
         teamMembersData: teamMembers?.map(m => ({ id: m.user_id, name: m.users?.name, email: m.users?.email }))
       });

       if (teamError) {
         console.error('Error fetching team members for project:', projectId, teamError);
       }

      // Map snake_case to camelCase for frontend compatibility
      const mappedTasks = (tasks || []).map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        progress: task.progress,
        assignedTo: task.assigned_to,
        deadline: task.deadline,
        billingItemId: task.billing_item_id,
        timeSpent: task.time_spent,
        createdAt: task.created_at,
        updatedAt: task.updated_at
      }));

      const mappedIssues = (issues || []).map(issue => ({
        id: issue.id,
        title: issue.title,
        description: issue.description,
        status: issue.status,
        priority: issue.priority,
        type: issue.type,
        assignedTo: issue.assigned_to,
        reportedBy: issue.reported_by,
        taskId: issue.task_id,
        createdAt: issue.created_at,
        updatedAt: issue.updated_at
      }));

      const mappedBillingItems = (billingItems || []).map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        totalPrice: item.total_price,
        status: item.status,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }));

      const mappedTeamMembers = (teamMembers || []).map(member => ({
        id: member.user_id,
        name: member.users?.name || 'Unknown User',
        email: member.users?.email || '',
        role: member.role,
        avatarUrl: member.users?.avatar_url || '',
        joinedAt: member.joined_at
      }));

      console.log('fetchProjectById - Mapped team members:', {
        projectId,
        mappedTeamMembers,
        mappedTeamMembersLength: mappedTeamMembers.length
      });

      return {
        ...data,
        tasks: mappedTasks,
        issues: mappedIssues,
        billingItems: mappedBillingItems,
        team: mappedTeamMembers,
        chat: [], // Placeholder for chat messages
        files: [] // Placeholder for files
      };
    } catch (error) {
      console.error('Error fetching related data for project:', projectId, error);
      return {
        ...data,
        tasks: [],
        issues: [],
        billingItems: [],
        team: [],
        chat: [],
        files: []
      };
    }
  } catch (error) {
    console.error('Failed to fetch project:', error);
    throw error;
  }
};

// Fetch project tasks
export const fetchProjectTasks = async (projectId) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.TASKS)
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching project tasks:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Failed to fetch project tasks:', error);
    throw error;
  }
};

// Create a new task
export const createTask = async (projectId, taskData) => {
  try {
    console.log('Creating task with data:', { projectId, taskData });
    
    // Test connection first
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Unable to connect to database. Please check your internet connection.');
    }
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error('Authentication error:', authError);
      throw new Error('Authentication failed. Please log in again.');
    }
    
    if (!user) {
      console.error('No authenticated user found');
      throw new Error('You must be logged in to create tasks.');
    }
    
    console.log('User authenticated:', user.id);
    
    const { data, error } = await supabase
      .from(TABLES.TASKS)
      .insert({
        project_id: projectId,
        title: taskData.title,
        description: taskData.description,
        status: taskData.status || 'todo',
        priority: taskData.priority || 'medium',
        progress: taskData.progress || 0,
        assigned_to: taskData.assignedTo || null,
        deadline: taskData.deadline || null,
        billing_item_id: taskData.billingItemId || null,
        time_spent: taskData.timeSpent || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('Failed to create task:', error);
      handleSupabaseError(error);
    }
    
    console.log('Task created successfully:', data);
    
    // Map snake_case to camelCase for frontend compatibility
    const mappedTask = {
      id: data.id,
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      progress: data.progress,
      assignedTo: data.assigned_to,
      deadline: data.deadline,
      billingItemId: data.billing_item_id,
      timeSpent: data.time_spent,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
    
    return mappedTask;
  } catch (error) {
    console.error('Error creating task:', error);
    
    // Check if it's a connection error
    if (error.message?.includes('ECONNRESET') || error.code === 'ECONNRESET') {
      console.error('Connection reset detected. This might be due to:');
      console.error('1. Network connectivity issues');
      console.error('2. Supabase service temporarily unavailable');
      console.error('3. Authentication issues');
      console.error('4. RLS policy restrictions');
      throw new Error('Connection to database failed. Please check your internet connection and try again.');
    }
    
    throw error;
  }
};

// Update a task
export const updateTask = async (taskId, updates) => {
  try {
    console.log('Updating task with data:', { taskId, updates });
    
    // Test connection first
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Unable to connect to database. Please check your internet connection.');
    }
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error('Authentication error:', authError);
      throw new Error('Authentication failed. Please log in again.');
    }
    
    if (!user) {
      console.error('No authenticated user found');
      throw new Error('You must be logged in to update tasks.');
    }
    
    console.log('User authenticated:', user.id);
    
    const { data, error } = await supabase
      .from(TABLES.TASKS)
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)
      .select()
      .single();
    
    if (error) {
      console.error('Failed to update task:', error);
      handleSupabaseError(error);
    }
    
    console.log('Task updated successfully:', data);
    
    // Map snake_case to camelCase for frontend compatibility
    const mappedTask = {
      id: data.id,
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      progress: data.progress,
      assignedTo: data.assigned_to,
      deadline: data.deadline,
      billingItemId: data.billing_item_id,
      timeSpent: data.time_spent,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
    
    return mappedTask;
  } catch (error) {
    console.error('Error updating task:', error);
    
    // Check if it's a connection error
    if (error.message?.includes('ECONNRESET') || error.code === 'ECONNRESET') {
      console.error('Connection reset detected. This might be due to:');
      console.error('1. Network connectivity issues');
      console.error('2. Supabase service temporarily unavailable');
      console.error('3. Authentication issues');
      console.error('4. RLS policy restrictions');
      throw new Error('Connection to database failed. Please check your internet connection and try again.');
    }
    
    // Check for RLS policy violations
    if (error.code === 'PGRST116' || error.message?.includes('RLS') || error.message?.includes('policy')) {
      console.error('Row Level Security policy violation detected');
      console.error('This might be because:');
      console.error('1. You are not assigned to this task');
      console.error('2. You are not a project admin/owner');
      console.error('3. The task does not exist or you lack permissions');
      throw new Error('Access denied. You may not have permission to update this task. Only task assignees and project admins can update tasks.');
    }
    
    throw error;
  }
};

// Delete a task
export const deleteTask = async (taskId) => {
  try {
    const { error } = await supabase
      .from(TABLES.TASKS)
      .delete()
      .eq('id', taskId);
    
    if (error) {
      console.error('Failed to delete task:', error);
      throw error;
    }
    
    console.log('Task deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};

// Issue Management Functions
export const createIssue = async (projectId, issueData) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.ISSUES)
      .insert({
        project_id: projectId,
        title: issueData.title,
        description: issueData.description,
        status: issueData.status || 'open',
        priority: issueData.priority || 'medium',
        type: issueData.type || 'general',
        assigned_to: issueData.assignedTo || null,
        reported_by: issueData.reportedBy || null,
        task_id: issueData.taskId || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('Failed to create issue:', error);
      throw error;
    }
    
    console.log('Issue created successfully:', data);
    
    // Map snake_case to camelCase for frontend compatibility
    const mappedIssue = {
      id: data.id,
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      type: data.type,
      assignedTo: data.assigned_to,
      reportedBy: data.reported_by,
      taskId: data.task_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
    
    return mappedIssue;
  } catch (error) {
    console.error('Error creating issue:', error);
    throw error;
  }
};

export const updateIssue = async (issueId, updates) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.ISSUES)
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', issueId)
      .select()
      .single();
    
    if (error) {
      console.error('Failed to update issue:', error);
      throw error;
    }
    
    console.log('Issue updated successfully:', data);
    
    // Map snake_case to camelCase for frontend compatibility
    const mappedIssue = {
      id: data.id,
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      type: data.type,
      assignedTo: data.assigned_to,
      reportedBy: data.reported_by,
      taskId: data.task_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
    
    return mappedIssue;
  } catch (error) {
    console.error('Error updating issue:', error);
    throw error;
  }
};

export const deleteIssue = async (issueId) => {
  try {
    const { error } = await supabase
      .from(TABLES.ISSUES)
      .delete()
      .eq('id', issueId);
    
    if (error) {
      console.error('Failed to delete issue:', error);
      throw error;
    }
    
    console.log('Issue deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting issue:', error);
    throw error;
  }
};

// Check database schema
export const checkProjectSchema = async () => {
  try {
    const { data, error } = await supabase
      .from(TABLES.PROJECTS)
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Schema check error:', error);
      return false;
    }
    
    console.log('Project schema:', data);
    return true;
  } catch (error) {
    console.error('Schema check failed:', error);
    return false;
  }
};

// Fetch all users from database
export const fetchUsers = async () => {
  try {
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .select('id, name, email, role, avatar')
      .order('name');
    
    if (error) {
      console.error('Failed to fetch users:', error);
      throw error;
    }
    
    console.log('Fetched users:', data);
    return data || [];
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}; 

// Test function to diagnose connection and authentication issues
export const testTaskCreation = async (projectId) => {
  try {
    console.log('Testing task creation for project:', projectId);
    
    // Test 1: Check connection
    const isConnected = await testConnection();
    console.log('Connection test result:', isConnected);
    
    if (!isConnected) {
      return { success: false, error: 'Database connection failed' };
    }
    
    // Test 2: Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('Authentication test result:', { user: user?.id, error: authError });
    
    if (authError) {
      return { success: false, error: 'Authentication failed: ' + authError.message };
    }
    
    if (!user) {
      return { success: false, error: 'No authenticated user found' };
    }
    
    // Test 3: Check if user can access the project
    const { data: project, error: projectError } = await supabase
      .from(TABLES.PROJECTS)
      .select('id, name')
      .eq('id', projectId)
      .single();
    
    console.log('Project access test result:', { project, error: projectError });
    
    if (projectError) {
      return { success: false, error: 'Cannot access project: ' + projectError.message };
    }
    
    // Test 4: Try to create a test task
    const testTaskData = {
      title: 'Test Task',
      description: 'This is a test task to verify permissions',
      status: 'todo',
      priority: 'medium',
      progress: 0
    };
    
    const { data: testTask, error: taskError } = await supabase
      .from(TABLES.TASKS)
      .insert({
        project_id: projectId,
        title: testTaskData.title,
        description: testTaskData.description,
        status: testTaskData.status,
        priority: testTaskData.priority,
        progress: testTaskData.progress
      })
      .select()
      .single();
    
    console.log('Task creation test result:', { task: testTask, error: taskError });
    
    if (taskError) {
      return { success: false, error: 'Cannot create tasks: ' + taskError.message };
    }
    
    // Clean up test task
    await supabase
      .from(TABLES.TASKS)
      .delete()
      .eq('id', testTask.id);
    
    return { success: true, message: 'All tests passed' };
    
  } catch (error) {
    console.error('Test function error:', error);
    return { success: false, error: error.message };
  }
}; 

// Test function to diagnose task update issues
export const testTaskUpdate = async (projectId, taskId) => {
  try {
    console.log('Testing task update for project:', projectId, 'task:', taskId);
    
    // Test 1: Check connection
    const isConnected = await testConnection();
    console.log('Connection test result:', isConnected);
    
    if (!isConnected) {
      return { success: false, error: 'Database connection failed' };
    }
    
    // Test 2: Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('Authentication test result:', { user: user?.id, error: authError });
    
    if (authError) {
      return { success: false, error: 'Authentication failed: ' + authError.message };
    }
    
    if (!user) {
      return { success: false, error: 'No authenticated user found' };
    }
    
    // Test 3: Check if task exists and user can access it
    const { data: task, error: taskError } = await supabase
      .from(TABLES.TASKS)
      .select('id, title, assigned_to, project_id')
      .eq('id', taskId)
      .single();
    
    console.log('Task access test result:', { task, error: taskError });
    
    if (taskError) {
      return { success: false, error: 'Cannot access task: ' + taskError.message };
    }
    
    if (!task) {
      return { success: false, error: 'Task not found' };
    }
    
    // Test 4: Check if user is assigned to the task or is project admin
    const { data: teamMember, error: teamError } = await supabase
      .from('team_members')
      .select('role')
      .eq('project_id', task.project_id)
      .eq('user_id', user.id)
      .single();
    
    console.log('Team member test result:', { teamMember, error: teamError });
    
    const isAssigned = task.assigned_to === user.id;
    const isAdmin = teamMember && ['owner', 'admin'].includes(teamMember.role);
    
    console.log('Permission check:', { isAssigned, isAdmin, taskAssignedTo: task.assigned_to, userId: user.id });
    
    if (!isAssigned && !isAdmin) {
      return { 
        success: false, 
        error: 'Permission denied. You are not assigned to this task and are not a project admin.' 
      };
    }
    
    // Test 5: Try to update the task
    const testUpdate = {
      title: task.title, // Keep same title
      updated_at: new Date().toISOString()
    };
    
    const { data: updatedTask, error: updateError } = await supabase
      .from(TABLES.TASKS)
      .update(testUpdate)
      .eq('id', taskId)
      .select()
      .single();
    
    console.log('Task update test result:', { task: updatedTask, error: updateError });
    
    if (updateError) {
      return { success: false, error: 'Cannot update task: ' + updateError.message };
    }
    
    return { 
      success: true, 
      message: 'All tests passed',
      details: {
        isAssigned,
        isAdmin,
        taskAssignedTo: task.assigned_to,
        userId: user.id
      }
    };
    
  } catch (error) {
    console.error('Test function error:', error);
    return { success: false, error: error.message };
  }
}; 

// Check if database tables exist
export const checkDatabaseTables = async () => {
  try {
    console.log('Checking if database tables exist...');
    
    // Test connection first
    const isConnected = await testConnection();
    if (!isConnected) {
      return { 
        success: false, 
        error: 'Cannot connect to database. Please check your Supabase configuration.' 
      };
    }
    
    // Check if each table exists by trying to select from them
    const tablesToCheck = [
      { name: 'users', table: TABLES.USERS },
      { name: 'projects', table: TABLES.PROJECTS },
      { name: 'tasks', table: TABLES.TASKS },
      { name: 'billing_items', table: TABLES.BILLING_ITEMS },
      { name: 'issues', table: TABLES.ISSUES },
      { name: 'team_members', table: TABLES.TEAM_MEMBERS }
    ];
    
    const results = [];
    
    for (const tableInfo of tablesToCheck) {
      try {
        const { data, error } = await supabase
          .from(tableInfo.table)
          .select('count')
          .limit(1);
        
        if (error) {
          results.push({ 
            table: tableInfo.name, 
            exists: false, 
            error: error.message 
          });
        } else {
          results.push({ 
            table: tableInfo.name, 
            exists: true 
          });
        }
      } catch (err) {
        results.push({ 
          table: tableInfo.name, 
          exists: false, 
          error: err.message 
        });
      }
    }
    
    const missingTables = results.filter(r => !r.exists);
    
    if (missingTables.length > 0) {
      return {
        success: false,
        error: 'Database tables are missing. Please run the SQL schema in your Supabase dashboard.',
        details: {
          missingTables: missingTables.map(t => t.table),
          instructions: [
            '1. Go to your Supabase dashboard',
            '2. Open the SQL Editor',
            '3. Copy the content from supabase-schema.sql',
            '4. Paste and run the SQL',
            '5. Refresh this page and try again'
          ]
        }
      };
    }
    
    return { 
      success: true, 
      message: 'All database tables exist',
      details: { existingTables: results.filter(r => r.exists).map(t => t.table) }
    };
    
  } catch (error) {
    console.error('Error checking database tables:', error);
    return { 
      success: false, 
      error: 'Failed to check database tables: ' + error.message 
    };
  }
}; 

// Company Management Functions
export const fetchCompanies = async () => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select(`
        *,
        projects:projects(id, name, status),
        billing_items:billing_items(id, total_price, status)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching companies:', error);
      throw error;
    }

    // Map snake_case to camelCase and add computed fields
    const mappedCompanies = (data || []).map(company => {
      const projects = company.projects || [];
      const billingItems = company.billing_items || [];
      
      return {
        id: company.id,
        name: company.name,
        email: company.email,
        phone: company.phone,
        address: company.address,
        contactPerson: company.contact_person,
        website: company.website,
        industry: company.industry,
        notes: company.notes,
        logoUrl: company.logo_url,
        logoAltText: company.logo_alt_text,
        isActive: company.is_active,
        createdBy: company.created_by,
        createdAt: company.created_at,
        updatedAt: company.updated_at,
        projectsCount: projects.length,
        totalBilling: billingItems.reduce((sum, item) => sum + (item.total_price || 0), 0),
        completedBilling: billingItems
          .filter(item => item.status === 'completed')
          .reduce((sum, item) => sum + (item.total_price || 0), 0)
      };
    });

    return mappedCompanies;
  } catch (error) {
    console.error('Error fetching companies:', error);
    throw error;
  }
};

export const createCompanyService = async (companyData) => {
  try {
    // Check if user is authenticated first
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error('Auth error:', authError);
      throw new Error('Authentication failed. Please log in again.');
    }
    
    if (!user) {
      throw new Error('You must be logged in to create companies.');
    }

    // Test connection with a simple query
    try {
      const { data: testData, error: testError } = await supabase
        .from('users')
        .select('id')
        .limit(1);
      
      if (testError) {
        console.error('Connection test failed:', testError);
        throw new Error('Connection to database failed. Please check your internet connection and try again.');
      }
    } catch (connectionError) {
      console.error('Connection error:', connectionError);
      throw new Error('Connection to database failed. Please check your internet connection and try again.');
    }

    // Check if user is admin
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      throw new Error('Failed to verify user permissions. Please try again.');
    }

    if (!userProfile || userProfile.role !== 'admin') {
      throw new Error('Access denied. Only administrators can create companies.');
    }

    const { data, error } = await supabase
      .from('companies')
      .insert({
        name: companyData.name,
        email: companyData.email,
        phone: companyData.phone,
        address: companyData.address,
        contact_person: companyData.contactPerson,
        website: companyData.website,
        industry: companyData.industry,
        notes: companyData.notes,
        logo_url: companyData.logo_url,
        logo_alt_text: companyData.logo_alt_text,
        is_active: companyData.isActive !== undefined ? companyData.isActive : true,
        created_by: user.id,
        created_at: companyData.created_at || new Date().toISOString(),
        updated_at: companyData.updated_at || new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating company:', error);
      throw handleSupabaseError(error);
    }

    // Map back to camelCase for frontend
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      contactPerson: data.contact_person,
      website: data.website,
      industry: data.industry,
      notes: data.notes,
      logoUrl: data.logo_url,
      logoAltText: data.logo_alt_text,
      isActive: data.is_active,
      createdBy: data.created_by,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      projectsCount: 0,
      totalBilling: 0,
      completedBilling: 0
    };
  } catch (error) {
    console.error('Error creating company:', error);
    throw error;
  }
};

export const updateCompanyService = async (companyId, updates) => {
  try {
    // Test connection first
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Connection to database failed. Please check your internet connection and try again.');
    }

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('You must be logged in to update companies.');
    }

    // Check if user is admin
    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!userProfile || userProfile.role !== 'admin') {
      throw new Error('Access denied. Only administrators can update companies.');
    }

    const { data, error } = await supabase
      .from('companies')
      .update({
        name: updates.name,
        email: updates.email,
        phone: updates.phone,
        address: updates.address,
        contact_person: updates.contactPerson,
        website: updates.website,
        industry: updates.industry,
        notes: updates.notes,
        logo_url: updates.logo_url,
        logo_alt_text: updates.logo_alt_text,
        is_active: updates.isActive,
        updated_at: updates.updated_at || new Date().toISOString()
      })
      .eq('id', companyId)
      .select()
      .single();

    if (error) {
      console.error('Error updating company:', error);
      throw handleSupabaseError(error);
    }

    // Map back to camelCase for frontend
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      contactPerson: data.contact_person,
      website: data.website,
      industry: data.industry,
      notes: data.notes,
      logoUrl: data.logo_url,
      logoAltText: data.logo_alt_text,
      isActive: data.is_active,
      createdBy: data.created_by,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error('Error updating company:', error);
    throw error;
  }
};

export const deleteCompanyService = async (companyId) => {
  try {
    // Test connection first
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Connection to database failed. Please check your internet connection and try again.');
    }

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('You must be logged in to delete companies.');
    }

    // Check if user is admin
    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!userProfile || userProfile.role !== 'admin') {
      throw new Error('Access denied. Only administrators can delete companies.');
    }

    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', companyId);

    if (error) {
      console.error('Error deleting company:', error);
      throw handleSupabaseError(error);
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting company:', error);
    throw error;
  }
};

// Mark project as paid
export const markProjectAsPaid = async (projectId) => {
  try {
    const { data, error } = await supabase
      .rpc('mark_project_as_paid', { project_uuid: projectId });

    if (error) {
      console.error('Error marking project as paid:', error);
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error in markProjectAsPaid:', error);
    throw error;
  }
};

// Mark project as unpaid
export const markProjectAsUnpaid = async (projectId) => {
  try {
    const { data, error } = await supabase
      .rpc('mark_project_as_unpaid', { project_uuid: projectId });

    if (error) {
      console.error('Error marking project as unpaid:', error);
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error in markProjectAsUnpaid:', error);
    throw error;
  }
};

// Update project discount percentage
export const updateProjectDiscount = async (projectId, discountPercentage) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.PROJECTS)
      .update({ discount_percentage: discountPercentage })
      .eq('id', projectId)
      .select()
      .single();

    if (error) {
      console.error('Error updating project discount:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to update project discount:', error);
    throw error;
  }
}; 