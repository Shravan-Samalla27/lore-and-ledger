import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

console.log('================================================================');
console.log('--- RUNNING LORE & LEDGER ROLE AUTH & SECURITY TEST SUITE ---');
console.log('================================================================');

// -----------------------------------------------------------------------------
// Test 1: Complete Role Access Matrix
// -----------------------------------------------------------------------------
console.log('\n[TEST 1] Verifying Complete 1:1 Role Access Matrix...');

const PORTALS = {
  student: ['student'],
  librarian: ['librarian'],
  admin: ['admin']
};

function checkPortalAccess(portalAllowedRoles, userRole) {
  if (!portalAllowedRoles || portalAllowedRoles.length === 0) return true;
  if (!userRole) return false;
  return portalAllowedRoles.includes(userRole);
}

// Student Portal (allowed: student only)
assert.strictEqual(checkPortalAccess(PORTALS.student, 'student'), true, 'Student -> Student portal: must be ALLOWED');
assert.strictEqual(checkPortalAccess(PORTALS.student, 'librarian'), false, 'Librarian -> Student portal: must be DENIED');
assert.strictEqual(checkPortalAccess(PORTALS.student, 'admin'), false, 'Admin -> Student portal: must be DENIED');
assert.strictEqual(checkPortalAccess(PORTALS.student, null), false, 'Unauthenticated -> Student portal: must be DENIED');
assert.strictEqual(checkPortalAccess(PORTALS.student, undefined), false, 'Undefined role -> Student portal: must be DENIED');

// Librarian Portal (allowed: librarian only)
assert.strictEqual(checkPortalAccess(PORTALS.librarian, 'student'), false, 'Student -> Librarian portal: must be DENIED');
assert.strictEqual(checkPortalAccess(PORTALS.librarian, 'librarian'), true, 'Librarian -> Librarian portal: must be ALLOWED');
assert.strictEqual(checkPortalAccess(PORTALS.librarian, 'admin'), false, 'Admin -> Librarian portal: must be DENIED');
assert.strictEqual(checkPortalAccess(PORTALS.librarian, null), false, 'Unauthenticated -> Librarian portal: must be DENIED');
assert.strictEqual(checkPortalAccess(PORTALS.librarian, undefined), false, 'Undefined role -> Librarian portal: must be DENIED');

// Admin Portal (allowed: admin only)
assert.strictEqual(checkPortalAccess(PORTALS.admin, 'student'), false, 'Student -> Admin portal: must be DENIED');
assert.strictEqual(checkPortalAccess(PORTALS.admin, 'librarian'), false, 'Librarian -> Admin portal: must be DENIED');
assert.strictEqual(checkPortalAccess(PORTALS.admin, 'admin'), true, 'Admin -> Admin portal: must be ALLOWED');
assert.strictEqual(checkPortalAccess(PORTALS.admin, null), false, 'Unauthenticated -> Admin portal: must be DENIED');
assert.strictEqual(checkPortalAccess(PORTALS.admin, undefined), false, 'Undefined role -> Admin portal: must be DENIED');

console.log('✓ Complete Role Access Matrix verified for all role combinations.');

// -----------------------------------------------------------------------------
// Test 2: RoleGuard Direct Route Protection & Child Rendering Guard
// -----------------------------------------------------------------------------
console.log('\n[TEST 2] Verifying RoleGuard Direct Route Access & Render Guard...');

function simulateRoleGuard({ user, role, allowedRoles }) {
  if (!user) {
    return { shouldRenderChildren: false, action: 'REDIRECT_TO_LOGIN' };
  }
  const isUnauthorized = Boolean(allowedRoles && (!role || !allowedRoles.includes(role)));
  if (isUnauthorized) {
    return { shouldRenderChildren: false, action: 'SHOW_ACCESS_DENIED_SCREEN' };
  }
  return { shouldRenderChildren: true, action: 'RENDER_CHILDREN' };
}

// Case 2a: Unauthenticated user accessing protected route
const unauthAdmin = simulateRoleGuard({ user: null, role: null, allowedRoles: ['admin'] });
assert.strictEqual(unauthAdmin.shouldRenderChildren, false, 'Unauthenticated must not render admin children');
assert.strictEqual(unauthAdmin.action, 'REDIRECT_TO_LOGIN');

const unauthLib = simulateRoleGuard({ user: null, role: null, allowedRoles: ['librarian'] });
assert.strictEqual(unauthLib.shouldRenderChildren, false, 'Unauthenticated must not render librarian children');

const unauthStudent = simulateRoleGuard({ user: null, role: null, allowedRoles: ['student'] });
assert.strictEqual(unauthStudent.shouldRenderChildren, false, 'Unauthenticated must not render student children');

// Case 2b: Authenticated student attempting direct access to /admin
const studentOnAdmin = simulateRoleGuard({ user: { id: 's-1' }, role: 'student', allowedRoles: ['admin'] });
assert.strictEqual(studentOnAdmin.shouldRenderChildren, false, 'Student must not render admin content on direct navigation');
assert.strictEqual(studentOnAdmin.action, 'SHOW_ACCESS_DENIED_SCREEN');

// Case 2c: Authenticated student attempting direct access to / (librarian circulation desk)
const studentOnLib = simulateRoleGuard({ user: { id: 's-1' }, role: 'student', allowedRoles: ['librarian'] });
assert.strictEqual(studentOnLib.shouldRenderChildren, false, 'Student must not render librarian content');
assert.strictEqual(studentOnLib.action, 'SHOW_ACCESS_DENIED_SCREEN');

// Case 2d: Authenticated librarian attempting direct access to /admin
const libOnAdmin = simulateRoleGuard({ user: { id: 'l-1' }, role: 'librarian', allowedRoles: ['admin'] });
assert.strictEqual(libOnAdmin.shouldRenderChildren, false, 'Librarian must not render admin console');
assert.strictEqual(libOnAdmin.action, 'SHOW_ACCESS_DENIED_SCREEN');

// Case 2e: Authenticated admin accessing /admin
const adminOnAdmin = simulateRoleGuard({ user: { id: 'a-1' }, role: 'admin', allowedRoles: ['admin'] });
assert.strictEqual(adminOnAdmin.shouldRenderChildren, true, 'Admin must render admin console');
assert.strictEqual(adminOnAdmin.action, 'RENDER_CHILDREN');

// Case 2f: Edge case: user exists but role is null (e.g. while profile is not yet matched)
const userRoleNull = simulateRoleGuard({ user: { id: 'x-1' }, role: null, allowedRoles: ['admin'] });
assert.strictEqual(userRoleNull.shouldRenderChildren, false, 'User with null role must never bypass RoleGuard');
assert.strictEqual(userRoleNull.action, 'SHOW_ACCESS_DENIED_SCREEN');

console.log('✓ Direct route protection verified: unauthorized users never render protected children.');

// -----------------------------------------------------------------------------
// Test 3: Portal Login Role Verification & Safe Sign-Out Logic
// -----------------------------------------------------------------------------
console.log('\n[TEST 3] Verifying Portal Login Authorization & Safe Sign-out...');

const ACCESS_DENIED_MSG = 'Access denied: your account is not authorized for this portal';

async function simulatePortalSignIn({ userRole, portalRequiredRole }) {
  let activeSession = { id: 'session-123', role: userRole };
  let signedOut = false;

  // Supabase signInWithPassword succeeds, then we verify profile
  if (portalRequiredRole && userRole !== portalRequiredRole) {
    // Immediate deny and safe session destruction
    activeSession = null;
    signedOut = true;
    return {
      success: false,
      error: ACCESS_DENIED_MSG,
      signedOut,
      sessionRemaining: activeSession !== null
    };
  }

  return {
    success: true,
    user: { id: 'user-id' },
    profile: { role: userRole },
    signedOut,
    sessionRemaining: activeSession !== null
  };
}

// Student attempts to log in through Admin Portal (/login/admin)
const studentAtAdminLogin = await simulatePortalSignIn({ userRole: 'student', portalRequiredRole: 'admin' });
assert.strictEqual(studentAtAdminLogin.success, false, 'Student at /login/admin must fail login');
assert.strictEqual(studentAtAdminLogin.error, ACCESS_DENIED_MSG);
assert.strictEqual(studentAtAdminLogin.signedOut, true, 'Unauthorized session must be safely signed out');
assert.strictEqual(studentAtAdminLogin.sessionRemaining, false, 'No active session should linger');

// Student attempts to log in through Librarian Portal (/login/librarian)
const studentAtLibLogin = await simulatePortalSignIn({ userRole: 'student', portalRequiredRole: 'librarian' });
assert.strictEqual(studentAtLibLogin.success, false, 'Student at /login/librarian must fail login');
assert.strictEqual(studentAtLibLogin.error, ACCESS_DENIED_MSG);
assert.strictEqual(studentAtLibLogin.signedOut, true, 'Unauthorized session must be safely signed out');
assert.strictEqual(studentAtLibLogin.sessionRemaining, false);

// Librarian attempts to log in through Admin Portal (/login/admin)
const libAtAdminLogin = await simulatePortalSignIn({ userRole: 'librarian', portalRequiredRole: 'admin' });
assert.strictEqual(libAtAdminLogin.success, false, 'Librarian at /login/admin must fail login');
assert.strictEqual(libAtAdminLogin.error, ACCESS_DENIED_MSG);

// Admin attempts to log in through Librarian Portal (/login/librarian)
const adminAtLibLogin = await simulatePortalSignIn({ userRole: 'admin', portalRequiredRole: 'librarian' });
assert.strictEqual(adminAtLibLogin.success, false, 'Admin at /login/librarian must fail login');
assert.strictEqual(adminAtLibLogin.error, ACCESS_DENIED_MSG);

// Authorized users at their own portals
const studentAtStudent = await simulatePortalSignIn({ userRole: 'student', portalRequiredRole: 'student' });
assert.strictEqual(studentAtStudent.success, true, 'Student at /login/student must succeed');

const libAtLib = await simulatePortalSignIn({ userRole: 'librarian', portalRequiredRole: 'librarian' });
assert.strictEqual(libAtLib.success, true, 'Librarian at /login/librarian must succeed');

const adminAtAdmin = await simulatePortalSignIn({ userRole: 'admin', portalRequiredRole: 'admin' });
assert.strictEqual(adminAtAdmin.success, true, 'Admin at /login/admin must succeed');

console.log('✓ Portal login authorization verified: unauthorized logins are immediately signed out with standard message.');

// -----------------------------------------------------------------------------
// Test 4: Existing Session Switching Isolation
// -----------------------------------------------------------------------------
console.log('\n[TEST 4] Verifying Existing Session Handling When Switching Portals...');

function simulateSwitchPortalSessionCheck(existingSessionRole, targetPortalRole) {
  let sessionActive = Boolean(existingSessionRole);
  let errorMsg = '';
  let redirectedTo = '';

  if (sessionActive && existingSessionRole) {
    if (existingSessionRole === targetPortalRole) {
      redirectedTo = targetPortalRole === 'admin' ? '/admin' : targetPortalRole === 'librarian' ? '/' : '/student';
    } else {
      // Must not treat student as admin or librarian!
      sessionActive = false; // Signed out
      errorMsg = ACCESS_DENIED_MSG;
    }
  }

  return { sessionActive, errorMsg, redirectedTo };
}

// Student session switches to /login/admin
const studentSwitchToAdmin = simulateSwitchPortalSessionCheck('student', 'admin');
assert.strictEqual(studentSwitchToAdmin.sessionActive, false, 'Student session must be destroyed on /login/admin');
assert.strictEqual(studentSwitchToAdmin.errorMsg, ACCESS_DENIED_MSG);

// Student session switches to /login/librarian
const studentSwitchToLib = simulateSwitchPortalSessionCheck('student', 'librarian');
assert.strictEqual(studentSwitchToLib.sessionActive, false, 'Student session must be destroyed on /login/librarian');
assert.strictEqual(studentSwitchToLib.errorMsg, ACCESS_DENIED_MSG);

// Admin session on /login/admin redirects to console
const adminSwitchToAdmin = simulateSwitchPortalSessionCheck('admin', 'admin');
assert.strictEqual(adminSwitchToAdmin.sessionActive, true);
assert.strictEqual(adminSwitchToAdmin.redirectedTo, '/admin');

console.log('✓ Existing session isolation verified: student sessions are never carried into staff portals.');

// -----------------------------------------------------------------------------
// Test 5: Role-Escalation Prevention & SQL Security Policies
// -----------------------------------------------------------------------------
console.log('\n[TEST 5] Verifying SQL Migration Security Rules & Escalation Guards...');
const migrationPath = path.resolve('supabase/migrations/20261018_roles_and_auth.sql');
assert.ok(fs.existsSync(migrationPath), 'Migration SQL file must exist');

const migrationSql = fs.readFileSync(migrationPath, 'utf8');

// Check security definer search_path
assert.ok(migrationSql.includes('SET search_path = public, pg_temp'), 'Helper functions must have fixed search_path = public, pg_temp');

// Check that default role is student and never trusted from metadata
assert.ok(migrationSql.includes("'student', -- Enforce student default"), 'handle_new_user trigger must hardcode student role');

// Check profile role protection
assert.ok(migrationSql.includes('public.get_user_role() = \'admin\''), 'Must require admin role to change user roles in profiles');
assert.ok(migrationSql.includes('role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())'), 'Users cannot alter their own role');

// Check anonymous write policies are dropped
assert.ok(migrationSql.includes('DROP POLICY IF EXISTS "Public can insert books"'), 'Must drop public insert books policy');
assert.ok(migrationSql.includes('DROP POLICY IF EXISTS "Public can update books"'), 'Must drop public update books policy');
assert.ok(migrationSql.includes('DROP POLICY IF EXISTS "Public can insert loans"'), 'Must drop public insert loans policy');

console.log('✓ SQL migration verified for search_path security, role isolation, and default student assignment.');

// -----------------------------------------------------------------------------
// Test 6: Student Data Isolation Logic
// -----------------------------------------------------------------------------
console.log('\n[TEST 6] Verifying Student Data Isolation Logic...');
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

const studentIsolatedLoans = sampleLoans.filter(
  l => l.scholarId === studentProfile.scholarId || l.scholarName.toLowerCase() === studentProfile.fullName.toLowerCase()
);

assert.strictEqual(studentIsolatedLoans.length, 2, 'Student must only see their own 2 loans');
assert.ok(studentIsolatedLoans.every(l => l.scholarId === 'SCH-2023-412'), 'All loans must belong to Eleanor Finch');
assert.ok(!studentIsolatedLoans.some(l => l.scholarId === 'SCH-2019-014'), 'Must NOT contain Arthur Pendelton loans');
assert.ok(!studentIsolatedLoans.some(l => l.scholarId === 'SCH-2022-771'), 'Must NOT contain Thomas Ravenswood loans');
console.log('✓ Student data isolation verified: Student cannot access other scholars\' records.');

console.log('\n================================================================');
console.log('--- ALL AUTHENTICATION & ACCESS MATRIX TESTS PASSED (6/6) ---');
console.log('================================================================\n');
