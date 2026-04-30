const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Path to .env
const envPath = path.resolve(__dirname, '../.env');

// SAFE CHECK (IMPORTANT FIX)
if (!fs.existsSync(envPath)) {
    console.log('.env not found, using defaults');
    process.exit(0);
}

// Load env only if file exists
const envConfig = dotenv.parse(fs.readFileSync(envPath));

const targetPath = path.resolve(__dirname, '../src/environments/environment.ts');

const envConfigFile = `
export const environment = {
  production: false,
  apiUrl: '${envConfig.BACKEND_URL || 'http://localhost:5238'}',
  geminiApiKey: '${envConfig.GEMINI_API_KEY || ''}'
};
`;

fs.writeFileSync(targetPath, envConfigFile);

console.log(`Output generated at ${targetPath}`);
