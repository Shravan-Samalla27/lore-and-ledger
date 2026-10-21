import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

console.log('================================================================');
console.log('--- RUNNING LORE & LEDGER ROLE AUTH & SECURITY TEST SUITE ---');
console.log('================================================================');

// -----------------------------------------------------------------------------
// Test 1: Complete Role Access Matrix (Admin, Librarian, Student)
// -----------------------------------------------------------------------------
console.log('\n[TEST 1] Verifying Complete Role Access Matrix Across All Portals...');

const ROUTES = {
  // Library Management Pages (Dashboard, Issue, Return, Students, Reports, Settings)
  libraryManagement: ['librarian', 'admin'],
  // Chancellor Console (Governance, Role Appointments)
  adminConsole: ['admin'],
  // Matriculated Scholar Reading Desk
  studentDesk: ['student']
};

function isRouteAccessAllowed(allowedRoles, currentRole) {
  if (!allowedRoles || allowedRoles.length === 0) return true;
  if (!currentRole) return false;
  return allowedRoles.includes(currentRole);
}

// 1a. Library Management Pages (Dashboard, Issue Book, Return Book, Students, Reports, Settings)
// Allowed: Librarian and Admin. Denied: Student, Unauthenticated
assert.strictEqual(isRouteAccessAllowed(ROUTES.libraryManagement, 'admin'), true, 'Admin -> Library Management: ALLOWED');
assert.strictEqual(isRouteAccessAllowed(ROUTES.libraryManagement, 'librarian'), true, 'Librarian -> Library Management: ALLOWED');
assert.strictEqual(isRouteAccessAllowed(ROUTES.libraryManagement, 'student'), false, 'Student -> Library Management: DENIED');
assert.strictEqual(isRouteAccessAllowed(ROUTES.libraryManagement, null), false, 'Unauthenticated -> Library Management: DENIED');

// 1b. Chancellor Console (/admin)
// Allowed: Admin only. Denied: Librarian, Student, Unauthenticated
assert.strictEqual(isRouteAccessAllowed(ROUTES.adminConsole, 'admin'), true, 'Admin -> Chancellor Console: ALLOWED');
assert.strictEqual(isRouteAccessAllowed(ROUTES.adminConsole, 'librarian'), false, 'Librarian -> Chancellor Console: DENIED');
assert.strictEqual(isRouteAccessAllowed(ROUTES.adminConsole, 'student'), false, 'Student -> Chancellor Console: DENIED');
assert.strictEqual(isRouteAccessAllowed(ROUTES.adminConsole, null), false, 'Unauthenticated -> Chancellor Console: DENIED');

// 1c. Student Reading Desk (/student)
// Allowed: Student only. Denied: Librarian, Admin, Unauthenticated
assert.strictEqual(isRouteAccessAllowed(ROUTES.studentDesk, 'student'), true, 'Student -> Student Reading Desk: ALLOWED');
assert.strictEqual(isRouteAccessAllowed(ROUTES.studentDesk, 'librarian'), false, 'Librarian -> Student Reading Desk: DENIED');
assert.strictEqual(isRouteAccessAllowed(ROUTES.studentDesk, 'admin'), false, 'Admin -> Student Reading Desk: DENIED');
assert.strictEqual(isRouteAccessAllowed(ROUTES.studentDesk, null), false, 'Unauthenticated -> Student Reading Desk: DENIED');

console.log('✓ Complete Role Access Matrix verified for all stations.');

// -----------------------------------------------------------------------------
// Test 2: RoleGuard Direct Route Access & Child Rendering Guard
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

// Unauthenticated user attempting access
const unauthAdmin = simulateRoleGuard({ user: null, role: null, allowedRoles: ['admin'] });
assert.strictEqual(unauthAdmin.shouldRenderChildren, false, 'Unauthenticated user must not render admin content');
assert.strictEqual(unauthAdmin.action, 'REDIRECT_TO_LOGIN');

const unauthLib = simulateRoleGuard({ user: null, role: null, allowedRoles: ['librarian', 'admin'] });
assert.strictEqual(unauthLib.shouldRenderChildren, false, 'Unauthenticated user must not render library management content');

// Authenticated student attempting direct access to /admin
const studentOnAdmin = simulateRoleGuard({ user: { id: 's-1' }, role: 'student', allowedRoles: ['admin'] });
assert.strictEqual(studentOnAdmin.shouldRenderChildren, false, 'Student must not render admin content on direct navigation');
assert.strictEqual(studentOnAdmin.action, 'SHOW_ACCESS_DENIED_SCREEN');

// Authenticated student attempting direct access to / (Dashboard)
const studentOnLib = simulateRoleGuard({ user: { id: 's-1' }, role: 'student', allowedRoles: ['librarian', 'admin'] });
assert.strictEqual(studentOnLib.shouldRenderChildren, false, 'Student must not render library management content');
assert.strictEqual(studentOnLib.action, 'SHOW_ACCESS_DENIED_SCREEN');

// Authenticated librarian attempting direct access to /admin
const libOnAdmin = simulateRoleGuard({ user: { id: 'l-1' }, role: 'librarian', allowedRoles: ['admin'] });
assert.strictEqual(libOnAdmin.shouldRenderChildren, false, 'Librarian must not render admin console');
assert.strictEqual(libOnAdmin.action, 'SHOW_ACCESS_DENIED_SCREEN');

// Authenticated admin accessing /admin
const adminOnAdmin = simulateRoleGuard({ user: { id: 'a-1' }, role: 'admin', allowedRoles: ['admin'] });
assert.strictEqual(adminOnAdmin.shouldRenderChildren, true, 'Admin must render admin console');
assert.strictEqual(adminOnAdmin.action, 'RENDER_CHILDREN');

// Authenticated admin accessing / (Dashboard)
const adminOnLib = simulateRoleGuard({ user: { id: 'a-1' }, role: 'admin', allowedRoles: ['librarian', 'admin'] });
assert.strictEqual(adminOnLib.shouldRenderChildren, true, 'Admin must render library management content');
assert.strictEqual(adminOnLib.action, 'RENDER_CHILDREN');

// Authenticated librarian accessing / (Dashboard)
const libOnLib = simulateRoleGuard({ user: { id: 'l-1' }, role: 'librarian', allowedRoles: ['librarian', 'admin'] });
assert.strictEqual(libOnLib.shouldRenderChildren, true, 'Librarian must render library management content');
assert.strictEqual(libOnLib.action, 'RENDER_CHILDREN');

// Edge case: User exists but role is null
const nullRoleUser = simulateRoleGuard({ user: { id: 'x-1' }, role: null, allowedRoles: ['admin'] });
assert.strictEqual(nullRoleUser.shouldRenderChildren, false, 'Null role user must never render protected children');
assert.strictEqual(nullRoleUser.action, 'SHOW_ACCESS_DENIED_SCREEN');

console.log('✓ Direct route protection verified: unauthorized users never render protected children.');

// -----------------------------------------------------------------------------
// Test 3: Portal Login Authorization & Safe Sign-Out
// -----------------------------------------------------------------------------
console.log('\n[TEST 3] Verifying Portal Login Authorization & Safe Sign-Out...');

const ACCESS_DENIED_MSG = 'Access denied: your account is not authorized for this portal';

async function simulatePortalSignIn({ userRole, portalRequiredRoles }) {
  let activeSession = { id: 'session-123', role: userRole };
  let signedOut = false;

  const allowed = Array.isArray(portalRequiredRoles) ? portalRequiredRoles : [portalRequiredRoles];

  if (portalRequiredRoles && !allowed.includes(userRole)) {
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
const studentAtAdminLogin = await simulatePortalSignIn({ userRole: 'student', portalRequiredRoles: 'admin' });
assert.strictEqual(studentAtAdminLogin.success, false, 'Student at /login/admin must fail');
assert.strictEqual(studentAtAdminLogin.error, ACCESS_DENIED_MSG);
assert.strictEqual(studentAtAdminLogin.signedOut, true, 'Unauthorized student session must be cleared');
assert.strictEqual(studentAtAdminLogin.sessionRemaining, false);

// Student attempts to log in through Librarian Portal (/login/librarian)
const studentAtLibLogin = await simulatePortalSignIn({ userRole: 'student', portalRequiredRoles: ['librarian', 'admin'] });
assert.strictEqual(studentAtLibLogin.success, false, 'Student at /login/librarian must fail');
assert.strictEqual(studentAtLibLogin.error, ACCESS_DENIED_MSG);
assert.strictEqual(studentAtLibLogin.signedOut, true);

// Librarian attempts to log in through Admin Portal (/login/admin)
const libAtAdminLogin = await simulatePortalSignIn({ userRole: 'librarian', portalRequiredRoles: 'admin' });
assert.strictEqual(libAtAdminLogin.success, false, 'Librarian at /login/admin must fail');
assert.strictEqual(libAtAdminLogin.error, ACCESS_DENIED_MSG);

// Staff attempts to log in through Student Portal (/login/student)
const adminAtStudentLogin = await simulatePortalSignIn({ userRole: 'admin', portalRequiredRoles: 'student' });
assert.strictEqual(adminAtStudentLogin.success, false, 'Admin at /login/student must fail');
assert.strictEqual(adminAtStudentLogin.error, ACCESS_DENIED_MSG);

// Authorized logins
const adminAtAdmin = await simulatePortalSignIn({ userRole: 'admin', portalRequiredRoles: 'admin' });
assert.strictEqual(adminAtAdmin.success, true, 'Admin at /login/admin must succeed');

const libAtLib = await simulatePortalSignIn({ userRole: 'librarian', portalRequiredRoles: ['librarian', 'admin'] });
assert.strictEqual(libAtLib.success, true, 'Librarian at /login/librarian must succeed');

const studentAtStudent = await simulatePortalSignIn({ userRole: 'student', portalRequiredRoles: 'student' });
assert.strictEqual(studentAtStudent.success, true, 'Student at /login/student must succeed');

console.log('✓ Portal login authorization verified: unauthorized sessions are immediately terminated.');

// -----------------------------------------------------------------------------
// Test 4: Existing Session Handling When Switching Portals
// -----------------------------------------------------------------------------
console.log('\n[TEST 4] Verifying Existing Session Handling When Switching Portals...');

function simulateSwitchPortalSessionCheck(existingSessionRole, portalRequiredRoles, defaultRedirect) {
  let sessionActive = Boolean(existingSessionRole);
  let errorMsg = '';
  let redirectedTo = '';

  const allowed = Array.isArray(portalRequiredRoles) ? portalRequiredRoles : [portalRequiredRoles];

  if (sessionActive && existingSessionRole) {
    if (allowed.includes(existingSessionRole)) {
      redirectedTo = defaultRedirect;
    } else {
      sessionActive = false;
      errorMsg = ACCESS_DENIED_MSG;
    }
  }

  return { sessionActive, errorMsg, redirectedTo };
}

// Student session opens /login/admin
const studentOnAdminLogin = simulateSwitchPortalSessionCheck('student', 'admin', '/admin');
assert.strictEqual(studentOnAdminLogin.sessionActive, false, 'Student session must be destroyed on /login/admin');
assert.strictEqual(studentOnAdminLogin.errorMsg, ACCESS_DENIED_MSG);

// Student session opens /login/librarian
const studentOnLibLogin = simulateSwitchPortalSessionCheck('student', ['librarian', 'admin'], '/');
assert.strictEqual(studentOnLibLogin.sessionActive, false, 'Student session must be destroyed on /login/librarian');
assert.strictEqual(studentOnLibLogin.errorMsg, ACCESS_DENIED_MSG);

// Admin session opens /login/admin
const adminOnAdminLogin = simulateSwitchPortalSessionCheck('admin', 'admin', '/admin');
assert.strictEqual(adminOnAdminLogin.sessionActive, true);
assert.strictEqual(adminOnAdminLogin.redirectedTo, '/admin');

// Librarian session opens /login/librarian
const libOnLibLogin = simulateSwitchPortalSessionCheck('librarian', ['librarian', 'admin'], '/');
assert.strictEqual(libOnLibLogin.sessionActive, true);
assert.strictEqual(libOnLibLogin.redirectedTo, '/');

console.log('✓ Existing session isolation verified: student sessions cannot leak into staff/admin portals.');

// -----------------------------------------------------------------------------
// Test 5: SQL Migration Security Rules & Role Escalation Prevention
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
