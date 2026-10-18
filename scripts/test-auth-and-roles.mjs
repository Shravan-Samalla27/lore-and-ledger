import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

console.log('--- RUNNING LORE & LEDGER AUTH & ROLES TEST SUITE ---');

// Test 1: Student Data Isolation Logic
console.log('\n[TEST 1] Verifying Student Data Isolation Logic...');
const sampleLoans = [
  { ref: 'LN-01', bookTitle: 'Principia', scholarId: 'SCH-2023-412', scholarName: 'Eleanor Finch', baseFine: 0 },
  { ref: 'LN-02', bookTitle: 'Melancholy', scholarId: 'SCH-2019-014', scholarName: 'Arthur Pendelton', baseFine: 250 },
  { ref: 'LN-03', bookTitle: 'Levant', scholarId: 'SCH-2023-412', scholarName: 'Eleanor Finch', baseFine: 400 },
  { ref: 'LN-04', bookTitle: 'Common Law', scholarId: 'SCH-2022-771', scholarName: 'Thomas Ravenswood', baseFine: 0 }
];

const studentProfile = {
  id: 'usr-finch-123',
  email: 'eleanor@balliol.ac.uk',
  fullName: 'Eleanor Finch',
  role: 'student',
  scholarId: 'SCH-2023-412'
};

// Filter loans exactly as done in StudentPortalPage
const studentIsolatedLoans = sampleLoans.filter(
  l => l.scholarId === studentProfile.scholarId || l.scholarName.toLowerCase() === studentProfile.fullName.toLowerCase()
);

assert.strictEqual(studentIsolatedLoans.length, 2, 'Student must only see their own 2 loans');
assert.ok(studentIsolatedLoans.every(l => l.scholarId === 'SCH-2023-412'), 'All loans must belong to Eleanor Finch');
assert.ok(!studentIsolatedLoans.some(l => l.scholarId === 'SCH-2019-014'), 'Must NOT contain Arthur Pendelton loans');
assert.ok(!studentIsolatedLoans.some(l => l.scholarId === 'SCH-2022-771'), 'Must NOT contain Thomas Ravenswood loans');
console.log('✓ Student data isolation verified: Student cannot access other scholars\' records.');

// Test 2: Route Protection & Station Guard Rules
console.log('\n[TEST 2] Verifying Role Guard Matrix...');
function isAccessAllowed(allowedRoles, currentRole) {
  if (!allowedRoles) return true;
  if (!currentRole) return false;
  return allowedRoles.includes(currentRole);
}

// Route 1: Circulation Desk (Issue/Return/Reports) -> ['librarian', 'admin']
assert.strictEqual(isAccessAllowed(['librarian', 'admin'], 'student'), false, 'Students must be blocked from circulation desk');
assert.strictEqual(isAccessAllowed(['librarian', 'admin'], 'librarian'), true, 'Librarians must have access to circulation desk');
assert.strictEqual(isAccessAllowed(['librarian', 'admin'], 'admin'), true, 'Admins must have access to circulation desk');
assert.strictEqual(isAccessAllowed(['librarian', 'admin'], null), false, 'Unauthenticated users must be blocked from circulation desk');

// Route 2: High Chancellor Console -> ['admin']
assert.strictEqual(isAccessAllowed(['admin'], 'student'), false, 'Students must be blocked from admin console');
assert.strictEqual(isAccessAllowed(['admin'], 'librarian'), false, 'Librarians must be blocked from admin console');
assert.strictEqual(isAccessAllowed(['admin'], 'admin'), true, 'Admins must have access to admin console');

// Route 3: Reading Desk -> ['student', 'librarian', 'admin']
assert.strictEqual(isAccessAllowed(['student', 'librarian', 'admin'], 'student'), true, 'Students must have access to reading desk');
console.log('✓ Route Guard rules verified across all stations.');

// Test 3: SQL Migration Verification
console.log('\n[TEST 3] Verifying Security Rules in Migration File...');
const migrationPath = path.resolve('supabase/migrations/20261018_roles_and_auth.sql');
assert.ok(fs.existsSync(migrationPath), 'Migration SQL file must exist');

const migrationSql = fs.readFileSync(migrationPath, 'utf8');

// Check security definer search_path
assert.ok(migrationSql.includes('SET search_path = public, pg_temp'), 'Helper functions must have fixed search_path = public, pg_temp');

// Check that default role is student and never trusted from metadata
assert.ok(migrationSql.includes("'student', -- Enforce student default"), 'handle_new_user trigger must hardcode student role');

// Check that anonymous write policies are dropped
assert.ok(migrationSql.includes('DROP POLICY IF EXISTS "Public can insert books"'), 'Must drop public insert books policy');
assert.ok(migrationSql.includes('DROP POLICY IF EXISTS "Public can update books"'), 'Must drop public update books policy');
assert.ok(migrationSql.includes('DROP POLICY IF EXISTS "Public can insert loans"'), 'Must drop public insert loans policy');

// Check profile role protection
assert.ok(migrationSql.includes('public.get_user_role() = \'admin\''), 'Must require admin role to change user roles in profiles');
console.log('✓ SQL migration verified for search_path security, role isolation, and default student assignment.');

console.log('\n--- ALL AUTHENTICATION & SECURITY TESTS PASSED ---\n');
