#!/usr/bin/env node

/**
 * Script to prepare service account JSON for production deployment
 * This script takes a service account JSON file and outputs it in a format
 * that's safe for production environment variables.
 */

const fs = require('fs');
const path = require('path');

function prepareServiceAccount(inputFile) {
  try {
    // Read the service account file
    const serviceAccountPath = path.resolve(process.cwd(), inputFile);
    
    if (!fs.existsSync(serviceAccountPath)) {
      console.error(`❌ Service account file not found: ${serviceAccountPath}`);
      process.exit(1);
    }

    const serviceAccountContent = fs.readFileSync(serviceAccountPath, 'utf8');
    
    // Parse to validate it's valid JSON
    const serviceAccount = JSON.parse(serviceAccountContent);
    
    // Validate required fields
    const requiredFields = ['type', 'project_id', 'private_key', 'client_email'];
    const missingFields = requiredFields.filter(field => !serviceAccount[field]);
    
    if (missingFields.length > 0) {
      console.error(`❌ Service account JSON is missing required fields: ${missingFields.join(', ')}`);
      process.exit(1);
    }
    
    // Create a minified version (no unnecessary whitespace)
    const minifiedJson = JSON.stringify(serviceAccount);
    
    // Create a base64 encoded version (alternative approach)
    const base64Json = Buffer.from(minifiedJson).toString('base64');
    
    console.log('✅ Service account validation successful!');
    console.log(`📧 Email: ${serviceAccount.client_email}`);
    console.log(`📁 Project: ${serviceAccount.project_id}`);
    console.log('');
    
    console.log('🔧 PRODUCTION SETUP OPTIONS:');
    console.log('');
    
    console.log('📋 OPTION 1: Direct JSON (recommended)');
    console.log('Copy this value to your GOOGLE_SERVICE_ACCOUNT_JSON environment variable:');
    console.log('⚠️  Make sure to wrap in single quotes when setting manually!');
    console.log('');
    console.log(minifiedJson);
    console.log('');
    
    console.log('📋 OPTION 2: Base64 Encoded (if Option 1 fails)');
    console.log('Set GOOGLE_SERVICE_ACCOUNT_BASE64 environment variable to:');
    console.log('');
    console.log(base64Json);
    console.log('');
    
    console.log('🚀 DEPLOYMENT TIPS:');
    console.log('');
    console.log('For Vercel:');
    console.log('  vercel env add GOOGLE_SERVICE_ACCOUNT_JSON');
    console.log('  (paste the JSON when prompted)');
    console.log('');
    console.log('For GitHub Actions:');
    console.log('  Go to Settings > Secrets and variables > Actions');
    console.log('  Add a new secret named GOOGLE_SERVICE_ACCOUNT_JSON');
    console.log('');
    console.log('For Netlify:');
    console.log('  Go to Site settings > Environment variables');
    console.log('  Add GOOGLE_SERVICE_ACCOUNT_JSON');
    console.log('');
    console.log('For Railway/Render/Heroku:');
    console.log('  Use their environment variable interface');
    console.log('  Paste the JSON as the value');
    
  } catch (error) {
    console.error('❌ Error processing service account:', error.message);
    process.exit(1);
  }
}

// Check command line arguments
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('📖 Usage: node scripts/prepare-service-account-for-production.js <path-to-service-account.json>');
  console.log('');
  console.log('Example:');
  console.log('  node scripts/prepare-service-account-for-production.js google-service-account.json');
  process.exit(1);
}

const inputFile = args[0];
prepareServiceAccount(inputFile);
