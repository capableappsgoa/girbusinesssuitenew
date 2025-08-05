// Test script to verify company logo functionality
// Run this in the browser console to debug company logo issues

console.log('🏢 Testing Company Logo Functionality...');

// Test 1: Check if companies exist and have logos
async function testCompanyLogo() {
  console.log('📋 Test 1: Checking companies and logos...');
  
  try {
    // Import the supabase client
    const { supabase } = await import('./src/lib/supabase.js');
    
    // Check if companies table exists and has data
    const { data: companies, error } = await supabase
      .from('companies')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('❌ Error fetching companies:', error);
      return;
    }
    
    console.log('📊 Companies found:', companies?.length || 0);
    
    if (companies && companies.length > 0) {
      companies.forEach((company, index) => {
        console.log(`🏢 Company ${index + 1}:`, {
          id: company.id,
          name: company.name,
          logo_url: company.logo_url,
          hasLogo: !!company.logo_url
        });
      });
    } else {
      console.log('⚠️ No companies found in database');
    }
  } catch (error) {
    console.error('❌ Error in test:', error);
  }
}

// Test 2: Check current project data
function testProjectData() {
  console.log('📋 Test 2: Checking current project data...');
  
  // Try to get project data from the current page
  const projectElements = document.querySelectorAll('[data-project-id]');
  console.log('🔍 Project elements found:', projectElements.length);
  
  // Check if we can access project data from React components
  if (window.React && window.React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
    console.log('⚛️ React dev tools available');
  }
  
  // Look for any company logo elements
  const logoElements = document.querySelectorAll('img[src*="logo"], img[alt*="logo"]');
  console.log('🖼️ Logo elements found:', logoElements.length);
  
  logoElements.forEach((img, index) => {
    console.log(`🖼️ Logo ${index + 1}:`, {
      src: img.src,
      alt: img.alt,
      visible: img.style.display !== 'none'
    });
  });
}

// Test 3: Create a test company with logo if none exist
async function createTestCompany() {
  console.log('📋 Test 3: Creating test company with logo...');
  
  try {
    const { supabase } = await import('./src/lib/supabase.js');
    
    // Check if we have any companies with logos
    const { data: companiesWithLogos } = await supabase
      .from('companies')
      .select('*')
      .not('logo_url', 'is', null)
      .limit(1);
    
    if (companiesWithLogos && companiesWithLogos.length > 0) {
      console.log('✅ Found companies with logos:', companiesWithLogos.length);
      return;
    }
    
    console.log('⚠️ No companies with logos found, creating test company...');
    
    // Create a test company with a logo URL
    const testCompany = {
      name: 'Test Company with Logo',
      email: 'test@example.com',
      phone: '+1234567890',
      address: '123 Test Street',
      contact_person: 'Test Contact',
      website: 'https://example.com',
      industry: 'Technology',
      logo_url: 'https://via.placeholder.com/150x150/4F46E5/FFFFFF?text=TC',
      logo_alt_text: 'Test Company Logo'
    };
    
    const { data, error } = await supabase
      .from('companies')
      .insert([testCompany])
      .select();
    
    if (error) {
      console.error('❌ Error creating test company:', error);
    } else {
      console.log('✅ Test company created:', data[0]);
    }
  } catch (error) {
    console.error('❌ Error creating test company:', error);
  }
}

// Test 4: Check if projects have company associations
async function testProjectCompanyAssociations() {
  console.log('📋 Test 4: Checking project-company associations...');
  
  try {
    const { supabase } = await import('./src/lib/supabase.js');
    
    // Check projects table for company_id field
    const { data: projects, error } = await supabase
      .from('projects')
      .select('id, name, company_id')
      .limit(5);
    
    if (error) {
      console.error('❌ Error fetching projects:', error);
      return;
    }
    
    console.log('📊 Projects found:', projects?.length || 0);
    
    if (projects && projects.length > 0) {
      projects.forEach((project, index) => {
        console.log(`📋 Project ${index + 1}:`, {
          id: project.id,
          name: project.name,
          company_id: project.company_id,
          hasCompany: !!project.company_id
        });
      });
    } else {
      console.log('⚠️ No projects found');
    }
  } catch (error) {
    console.error('❌ Error checking project associations:', error);
  }
}

// Test 5: Test fetching company by ID
async function testFetchCompanyById() {
  console.log('📋 Test 5: Testing fetch company by ID...');
  
  try {
    const { supabase } = await import('./src/lib/supabase.js');
    
    // First, get a project with company_id
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, name, company_id')
      .not('company_id', 'is', null)
      .limit(1);
    
    if (projectsError) {
      console.error('❌ Error fetching projects:', projectsError);
      return;
    }
    
    if (!projects || projects.length === 0) {
      console.log('⚠️ No projects with company_id found');
      return;
    }
    
    const project = projects[0];
    console.log('📋 Found project with company_id:', {
      projectId: project.id,
      projectName: project.name,
      companyId: project.company_id
    });
    
    // Now fetch the company data
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', project.company_id)
      .single();
    
    if (companyError) {
      console.error('❌ Error fetching company:', companyError);
      return;
    }
    
    console.log('✅ Company data fetched:', {
      id: company.id,
      name: company.name,
      logo_url: company.logo_url,
      hasLogo: !!company.logo_url,
      logo_alt_text: company.logo_alt_text
    });
    
    // Test if the logo URL is accessible
    if (company.logo_url) {
      console.log('🖼️ Testing logo URL accessibility...');
      try {
        const response = await fetch(company.logo_url);
        if (response.ok) {
          console.log('✅ Logo URL is accessible');
        } else {
          console.log('❌ Logo URL returned status:', response.status);
        }
      } catch (error) {
        console.log('❌ Logo URL is not accessible:', error.message);
      }
    } else {
      console.log('⚠️ Company has no logo URL');
    }
    
  } catch (error) {
    console.error('❌ Error in fetch company test:', error);
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Running all company logo tests...\n');
  
  await testCompanyLogo();
  console.log('\n---');
  
  testProjectData();
  console.log('\n---');
  
  await createTestCompany();
  console.log('\n---');
  
  await testProjectCompanyAssociations();
  
  console.log('\n✅ Company logo test completed!');
}

// Export functions for manual testing
window.companyLogoTests = {
  testCompanyLogo,
  testProjectData,
  createTestCompany,
  testProjectCompanyAssociations,
  testFetchCompanyById,
  runAllTests
};

console.log('🏢 Company logo test functions loaded!');
console.log('💡 Run companyLogoTests.runAllTests() to test everything');
console.log('💡 Run companyLogoTests.testCompanyLogo() to check companies');
console.log('💡 Run companyLogoTests.testProjectData() to check current project'); 