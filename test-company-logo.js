// Test script to verify company logo functionality
import { supabase } from './src/lib/supabase.js';

async function testCompanyLogo() {
  console.log('Testing company logo functionality...');
  
  try {
    // Test 1: Check if logo columns exist
    console.log('\n1. Checking if logo columns exist in companies table...');
    const { data: columns, error: columnsError } = await supabase
      .from('companies')
      .select('*')
      .limit(1);
    
    if (columnsError) {
      console.error('Error checking companies table:', columnsError);
      return;
    }
    
    console.log('Companies table structure:', Object.keys(columns[0] || {}));
    
    // Test 2: Check existing companies for logo data
    console.log('\n2. Checking existing companies for logo data...');
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, name, logo_url, logo_alt_text')
      .limit(5);
    
    if (companiesError) {
      console.error('Error fetching companies:', companiesError);
      return;
    }
    
    console.log('Existing companies:', companies);
    
    // Test 3: Create a test company with logo if none exist
    if (companies.length === 0) {
      console.log('\n3. Creating test company with logo...');
      const { data: newCompany, error: createError } = await supabase
        .from('companies')
        .insert({
          name: 'Test Company with Logo',
          email: 'test@example.com',
          phone: '+1234567890',
          address: '123 Test Street',
          contact_person: 'Test Contact',
          website: 'https://example.com',
          industry: 'Technology',
          logo_url: 'https://via.placeholder.com/150x150/007bff/ffffff?text=LOGO',
          logo_alt_text: 'Test Company Logo'
        })
        .select()
        .single();
      
      if (createError) {
        console.error('Error creating test company:', createError);
        return;
      }
      
      console.log('Created test company:', newCompany);
    }
    
    // Test 4: Test project with company association
    console.log('\n4. Testing project with company association...');
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select(`
        id,
        name,
        company_id,
        companies (
          id,
          name,
          logo_url,
          logo_alt_text
        )
      `)
      .not('company_id', 'is', null)
      .limit(3);
    
    if (projectsError) {
      console.error('Error fetching projects with companies:', projectsError);
      return;
    }
    
    console.log('Projects with companies:', projects);
    
    console.log('\n✅ Company logo test completed!');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testCompanyLogo(); 