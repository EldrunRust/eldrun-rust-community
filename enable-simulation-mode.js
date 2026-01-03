// Script to enable full simulation mode for Eldrun Website
const fs = require('fs');
const path = require('path');

console.log('🚀 Aktiviere vollständigen Simulationsmodus für Eldrun...\n');

// Read .env.example to get the structure
const envExample = fs.readFileSync('.env.example', 'utf8');
const envPath = '.env';

// Check if .env exists
let envContent = '';
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
  console.log('✓ .env Datei gefunden - aktualisiere Einstellungen...');
} else {
  envContent = envExample;
  console.log('✓ Erstelle neue .env Datei aus .env.example...');
}

// Function to update or add env variable
function updateEnvVar(content, key, value) {
  const regex = new RegExp(`^${key}=.*$`, 'gm');
  if (regex.test(content)) {
    return content.replace(regex, `${key}="${value}"`);
  } else {
    return content + `\n${key}="${value}"`;
  }
}

// Enable all simulation features
envContent = updateEnvVar(envContent, 'DEMO_MODE', 'true');
envContent = updateEnvVar(envContent, 'SIMULATION_MODE', 'true');
envContent = updateEnvVar(envContent, 'SEED_MODE', 'true');
envContent = updateEnvVar(envContent, 'SIMULATION_INTENSITY', '10');
envContent = updateEnvVar(envContent, 'SIMULATION_MODULES', 'server,heatmap,chat,forum,events,casino,trading');

// Enable all features
envContent = updateEnvVar(envContent, 'FEATURE_CASINO', 'true');
envContent = updateEnvVar(envContent, 'FEATURE_AUCTION', 'true');
envContent = updateEnvVar(envContent, 'FEATURE_TRADING', 'true');
envContent = updateEnvVar(envContent, 'FEATURE_BATTLEPASS', 'true');
envContent = updateEnvVar(envContent, 'FEATURE_HEATMAP', 'true');
envContent = updateEnvVar(envContent, 'FEATURE_CHAT', 'true');
envContent = updateEnvVar(envContent, 'FEATURE_STREAMS', 'true');

// Set database for dev
envContent = updateEnvVar(envContent, 'DATABASE_URL', 'file:./dev.db');

// Set JWT secret for dev
if (!envContent.includes('JWT_SECRET=') || envContent.match(/JWT_SECRET=""/)) {
  envContent = updateEnvVar(envContent, 'JWT_SECRET', 'dev_secret_key_for_simulation_mode_only_not_for_production');
}

// Write the updated content
fs.writeFileSync(envPath, envContent);

console.log('\n✅ Simulationsmodus-Konfiguration abgeschlossen!\n');
console.log('🔥 Aktivierte Features:');
console.log('   - DEMO_MODE: true');
console.log('   - SIMULATION_MODE: true');
console.log('   - SEED_MODE: true');
console.log('   - SIMULATION_INTENSITY: 10 (Maximum)');
console.log('   - SIMULATION_MODULES: Alle Module aktiv');
console.log('   - Alle FEATURE_* Flags: true\n');

console.log('📋 Nächste Schritte:');
console.log('   1. npm run db:push (Datenbank erstellen)');
console.log('   2. npm run seed:content (Demo-Daten laden)');
console.log('   3. npm run sim:start (Simulation starten)');
console.log('   4. npm run dev (Server starten)\n');
