// Test script to check billing items functionality
import { supabase } from './src/lib/supabase.js';

async function testBillingItems() {
  console.log('Testing billing items functionality...');
  
  try {
    // Test 1: Check if billing_items table exists
    console.log('\n1. Checking if billing_items table exists...');
    const { data: tables, error: tablesError } = await supabase
      .from('billing_items')
      .select('*')
      .limit(1);
    
    if (tablesError) {
      console.error('Error checking billing_items table:', tablesError);
      return;
    }
    
    console.log('Billing items table structure:', Object.keys(tables[0] || {}));
    
    // Test 2: Check if we can create a billing item
    console.log('\n2. Testing billing item creation...');
    
    // First, get a project ID
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, name')
      .limit(1);
    
    if (projectsError) {
      console.error('Error fetching projects:', projectsError);
      return;
    }
    
    if (projects.length === 0) {
      console.log('No projects found. Creating a test project first...');
      const { data: newProject, error: createProjectError } = await supabase
        .from('projects')
        .insert({
          name: 'Test Project for Billing',
          type: '2D',
          client: 'Test Client',
          description: 'Test project for billing items',
          status: 'pending',
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        })
        .select()
        .single();
      
      if (createProjectError) {
        console.error('Error creating test project:', createProjectError);
        return;
      }
      
      console.log('Created test project:', newProject);
      projects[0] = newProject;
    }
    
    const projectId = projects[0].id;
    console.log('Using project ID:', projectId);
    
    // Test 3: Create a billing item
    const testBillingItem = {
      project_id: projectId,
      name: 'Test Billing Item',
      description: 'This is a test billing item',
      quantity: 1,
      unit_price: 100.00,
      total_price: 100.00,
      status: 'pending'
    };
    
    console.log('Creating billing item:', testBillingItem);
    
    const { data: newBillingItem, error: createBillingError } = await supabase
      .from('billing_items')
      .insert(testBillingItem)
      .select()
      .single();
    
    if (createBillingError) {
      console.error('Error creating billing item:', createBillingError);
      console.error('Error details:', {
        message: createBillingError.message,
        details: createBillingError.details,
        hint: createBillingError.hint,
        code: createBillingError.code
      });
      return;
    }
    
    console.log('Successfully created billing item:', newBillingItem);
    
    // Test 4: Fetch billing items for the project
    console.log('\n3. Testing billing item fetching...');
    const { data: billingItems, error: fetchError } = await supabase
      .from('billing_items')
      .select('*')
      .eq('project_id', projectId);
    
    if (fetchError) {
      console.error('Error fetching billing items:', fetchError);
      return;
    }
    
    console.log('Billing items for project:', billingItems);
    
    console.log('\n✅ Billing items test completed successfully!');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testBillingItems(); 