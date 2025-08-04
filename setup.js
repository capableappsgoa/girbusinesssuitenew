const fs = require('fs');
const path = require('path');

console.log('🚀 GIR Project Manager Setup');
console.log('=============================\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('✅ .env file already exists');
} else {
  console.log('📝 Creating .env file...');
  
  const envContent = `# Supabase Configuration
# Replace these with your actual Supabase credentials
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here

# Application Environment
REACT_APP_ENV=development
`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully!');
  console.log('⚠️  Please update the .env file with your actual Supabase credentials');
}

console.log('\n📋 Next Steps:');
console.log('1. Create a Supabase project at https://supabase.com');
console.log('2. Get your Project URL and Anon Key from Settings → API');
console.log('3. Update the .env file with your credentials');
console.log('4. Run the SQL schema from supabase-schema.sql in your Supabase SQL Editor');
console.log('5. Start the app with: npm start');
console.log('\n🎉 Your app will work with mock data until you configure Supabase!'); 