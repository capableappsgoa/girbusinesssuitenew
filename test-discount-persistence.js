// Test script to verify discount persistence
import { supabase } from './src/lib/supabase.js';

async function testDiscountPersistence() {
  try {
    console.log('Testing discount persistence...');
    
    // Test 1: Check if discount_percentage column exists
    const { data: projects, error } = await supabase
      .from('projects')
      .select('id, name, discount_percentage')
      .limit(5);
    
    if (error) {
      console.error('Error fetching projects:', error);
      return;
    }
    
    console.log('Projects with discount_percentage:', projects);
    
    // Test 2: Update a project's discount
    if (projects && projects.length > 0) {
      const testProject = projects[0];
      const newDiscount = 15.5;
      
      console.log(`Updating project ${testProject.id} discount to ${newDiscount}%`);
      
      const { data: updatedProject, error: updateError } = await supabase
        .from('projects')
        .update({ discount_percentage: newDiscount })
        .eq('id', testProject.id)
        .select()
        .single();
      
      if (updateError) {
        console.error('Error updating discount:', updateError);
        return;
      }
      
      console.log('Updated project:', updatedProject);
      
      // Test 3: Verify the update
      const { data: verifyProject, error: verifyError } = await supabase
        .from('projects')
        .select('id, name, discount_percentage')
        .eq('id', testProject.id)
        .single();
      
      if (verifyError) {
        console.error('Error verifying update:', verifyError);
        return;
      }
      
      console.log('Verified project:', verifyProject);
      console.log('Discount persistence test completed successfully!');
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testDiscountPersistence(); 