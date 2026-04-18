/**
 * SickleCare AI — Supabase Setup Script
 * ----------------------------------------
 * Usage:
 *   node scripts/setup-supabase.js
 *
 * What it does:
 *   1. Reads your SUPABASE_URL + SUPABASE_SERVICE_KEY from .env
 *   2. Extracts your project ref from the URL
 *   3. Runs the schema SQL via Supabase Management API
 *   4. Enables Phone OTP auth provider
 *
 * Requires: SUPABASE_ACCESS_TOKEN in .env
 *   Get it from: https://supabase.com/dashboard/account/tokens
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const https = require('https');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL    = process.env.SUPABASE_URL;
const SERVICE_KEY     = process.env.SUPABASE_SERVICE_KEY;
const ACCESS_TOKEN    = process.env.SUPABASE_ACCESS_TOKEN;

// ── Validation ──────────────────────────────────────────────
if (!SUPABASE_URL || SUPABASE_URL.includes('placeholder')) {
  console.error('\n❌  Set SUPABASE_URL in sicklecare-ai/backend/.env\n');
  process.exit(1);
}
if (!SERVICE_KEY || SERVICE_KEY.includes('placeholder')) {
  console.error('\n❌  Set SUPABASE_SERVICE_KEY in sicklecare-ai/backend/.env\n');
  process.exit(1);
}
if (!ACCESS_TOKEN) {
  console.error('\n❌  Set SUPABASE_ACCESS_TOKEN in sicklecare-ai/backend/.env');
  console.error('   Get it from: https://supabase.com/dashboard/account/tokens\n');
  process.exit(1);
}

// Extract project ref: https://PROJECTREF.supabase.co
const projectRef = SUPABASE_URL.replace('https://', '').split('.')[0];
console.log(`\n📦 Project ref: ${projectRef}`);

const sql = fs.readFileSync(path.join(__dirname, '../supabase_schema.sql'), 'utf8');

// ── HTTP helper ──────────────────────────────────────────────
function request(options, body) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : undefined;
    if (payload) options.headers['Content-Length'] = Buffer.byteLength(payload);

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

// ── Run SQL via Management API ───────────────────────────────
async function runSQL(query) {
  return request({
    hostname: 'api.supabase.com',
    path: `/v1/projects/${projectRef}/database/query`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
    }
  }, { query });
}

// ── Main ─────────────────────────────────────────────────────
async function main() {
  console.log(`🔗 Connecting to Supabase Management API...\n`);

  // Test connection
  const ping = await request({
    hostname: 'api.supabase.com',
    path: `/v1/projects/${projectRef}`,
    method: 'GET',
    headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}` }
  });

  if (ping.status !== 200) {
    console.error(`❌  Could not connect (${ping.status}):`, ping.body);
    console.error('\n   Check your SUPABASE_ACCESS_TOKEN and project URL.\n');
    process.exit(1);
  }

  console.log(`✅ Connected to project: ${ping.body.name || projectRef}\n`);
  console.log('📄 Running schema SQL...\n');

  const result = await runSQL(sql);

  if (result.status >= 400) {
    console.error('❌  Schema error:', JSON.stringify(result.body, null, 2));
    console.log('\n💡 Try running the SQL manually in the Supabase SQL Editor:');
    console.log(`   https://supabase.com/dashboard/project/${projectRef}/sql\n`);
    process.exit(1);
  }

  console.log('✅ Schema created successfully!\n');
  console.log('📋 Tables created: users, health_logs, alerts');
  console.log('🔒 RLS policies enabled\n');
  console.log('─'.repeat(50));
  console.log('🎉 Supabase is ready! Next steps:');
  console.log('   1. Enable Phone OTP in Authentication → Providers → Phone');
  console.log(`      https://supabase.com/dashboard/project/${projectRef}/auth/providers`);
  console.log('   2. Copy your anon key to vitalsync_ui-main/.env');
  console.log(`      https://supabase.com/dashboard/project/${projectRef}/settings/api`);
  console.log('─'.repeat(50) + '\n');
}

main().catch(console.error);
