#!/usr/bin/env node

/**
 * Helper script to convert Google Service Account JSON file to environment variable format
 * Usage: node scripts/convert-service-account.js path/to/service-account.json
 */

const fs = require('fs');
const path = require('path');

function main() {
  const args = process.argv.slice(2);
  
  if (args.length !== 1) {
    console.error('Usage: node scripts/convert-service-account.js <path-to-service-account.json>');
    console.error('');
    console.error('Example:');
    console.error('  node scripts/convert-service-account.js ./google-service-account.json');
    process.exit(1);
  }

  const filePath = args[0];
  const fullPath = path.resolve(filePath);

  if (!fs.existsSync(fullPath)) {
    console.error(`❌ File not found: ${fullPath}`);
    process.exit(1);
  }

  try {
    const fileContent = fs.readFileSync(fullPath, 'utf8');
    const jsonData = JSON.parse(fileContent);
    
    // Validate that it's a service account file
    if (jsonData.type !== 'service_account') {
      console.error('❌ This doesn\'t appear to be a service account JSON file');
      process.exit(1);
    }

    // Create the environment variable string
    const envVarValue = JSON.stringify(jsonData);
    
    console.log('✅ Service account JSON converted successfully!');
    console.log('');
    console.log('📋 Copy this line to your .env.local file:');
    console.log('');
    console.log(`GOOGLE_SERVICE_ACCOUNT_JSON='${envVarValue}'`);
    console.log('');
    console.log('🚀 For deployment platforms, set this environment variable:');
    console.log('');
    console.log('Variable Name: GOOGLE_SERVICE_ACCOUNT_JSON');
    console.log('Variable Value:');
    console.log(envVarValue);
    console.log('');
    console.log('💡 Tip: Make sure to remove any actual files containing secrets from your repository!');
    
  } catch (error) {
    console.error('❌ Error processing file:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
