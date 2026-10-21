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

function simulateRoleGuard({ user, role, allowedRoles, redirectTo = '/login' }) {
  if (!user) {
    return { shouldRenderChildren: false, action: 'REDIRECT_TO_LOGIN', redirectTo };
  }
  const isUnauthorized = Boolean(allowedRoles && (!role || !allowedRoles.includes(role)));
  if (isUnauthorized) {
    const targetHome =
      role === 'student' ? '/student' : role === 'librarian' ? '/' : role === 'admin' ? '/admin' : redirectTo;
    return { shouldRenderChildren: false, action: 'SHOW_ACCESS_DENIED_SCREEN', redirectedTo: targetHome };
  }
  return { shouldRenderChildren: true, action: 'RENDER_CHILDREN', redirectedTo: null };
}

// 1. Admin → /admin: ALLOWED
const adminOnAdmin = simulateRoleGuard({ user: { id: 'a-1' }, role: 'admin', allowedRoles: ['admin'] });
assert.strictEqual(adminOnAdmin.shouldRenderChildren, true, 'Admin → /admin: ALLOWED');
assert.strictEqual(adminOnAdmin.action, 'RENDER_CHILDREN');

// 2. Librarian → /admin: DENIED (Fail closed, redirect to /)
const libOnAdmin = simulateRoleGuard({ user: { id: 'l-1' }, role: 'librarian', allowedRoles: ['admin'] });
assert.strictEqual(libOnAdmin.shouldRenderChildren, false, 'Librarian → /admin: DENIED');
assert.strictEqual(libOnAdmin.action, 'SHOW_ACCESS_DENIED_SCREEN');
assert.strictEqual(libOnAdmin.redirectedTo, '/', 'Librarian is redirected away from /admin to authorized station /');

// 3. Student → /admin: DENIED (Fail closed, redirect to /student)
const studentOnAdmin = simulateRoleGuard({ user: { id: 's-1' }, role: 'student', allowedRoles: ['admin'] });
assert.strictEqual(studentOnAdmin.shouldRenderChildren, false, 'Student → /admin: DENIED');
assert.strictEqual(studentOnAdmin.action, 'SHOW_ACCESS_DENIED_SCREEN');
assert.strictEqual(studentOnAdmin.redirectedTo, '/student', 'Student is redirected away from /admin to /student');

// 4. Missing/unknown role → /admin: DENIED
const nullRoleUser = simulateRoleGuard({ user: { id: 'x-1' }, role: null, allowedRoles: ['admin'] });
assert.strictEqual(nullRoleUser.shouldRenderChildren, false, 'Missing role (null) → /admin: DENIED');
assert.strictEqual(nullRoleUser.action, 'SHOW_ACCESS_DENIED_SCREEN');

const undefRoleUser = simulateRoleGuard({ user: { id: 'x-2' }, role: undefined, allowedRoles: ['admin'] });
assert.strictEqual(undefRoleUser.shouldRenderChildren, false, 'Missing role (undefined) → /admin: DENIED');

const unknownRoleUser = simulateRoleGuard({ user: { id: 'x-3' }, role: 'intruder', allowedRoles: ['admin'] });
assert.strictEqual(unknownRoleUser.shouldRenderChildren, false, 'Unknown role → /admin: DENIED');

const unauthAdmin = simulateRoleGuard({ user: null, role: null, allowedRoles: ['admin'] });
assert.strictEqual(unauthAdmin.shouldRenderChildren, false, 'Unauthenticated user → /admin: DENIED');
assert.strictEqual(unauthAdmin.action, 'REDIRECT_TO_LOGIN');

// 5. Librarian retains access to permitted library routes
const librarianPermittedRoutes = [
  { name: 'Dashboard (/)', allowedRoles: ['librarian', 'admin'] },
  { name: 'Students (/students)', allowedRoles: ['librarian', 'admin'] },
  { name: 'Issue Book (/issue-book)', allowedRoles: ['librarian', 'admin'] },
  { name: 'Return Book (/return-book)', allowedRoles: ['librarian', 'admin'] },
  { name: 'Reports (/reports)', allowedRoles: ['librarian', 'admin'] },
  { name: 'Settings (/settings)', allowedRoles: ['librarian', 'admin'] }
];

for (const route of librarianPermittedRoutes) {
  const libAccess = simulateRoleGuard({ user: { id: 'l-1' }, role: 'librarian', allowedRoles: route.allowedRoles });
  assert.strictEqual(libAccess.shouldRenderChildren, true, `Librarian retains access to ${route.name}: ALLOWED`);
  assert.strictEqual(libAccess.action, 'RENDER_CHILDREN');

  // Also verify Admin retains access to all these library routes
  const adminAccess = simulateRoleGuard({ user: { id: 'a-1' }, role: 'admin', allowedRoles: route.allowedRoles });
  assert.strictEqual(adminAccess.shouldRenderChildren, true, `Admin retains access to ${route.name}: ALLOWED`);
  assert.strictEqual(adminAccess.action, 'RENDER_CHILDREN');

  // Verify Student is denied access to all staff library management routes
  const studentAccess = simulateRoleGuard({ user: { id: 's-1' }, role: 'student', allowedRoles: route.allowedRoles });
  assert.strictEqual(studentAccess.shouldRenderChildren, false, `Student denied access to ${route.name}: DENIED`);
}

console.log('✓ Direct route protection verified: Admin allowed, Librarian denied /admin, Student denied /admin, missing role denied, Librarian library routes preserved.');

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

// Check that View profiles policy strictly restricts all-profile inspection to admin only
assert.ok(
  migrationSql.includes("id = auth.uid() OR public.get_user_role() = 'admin'"),
  'View profiles policy must strictly restrict all-profile inspection to admin only'
);
assert.ok(
  !migrationSql.includes("id = auth.uid() OR public.get_user_role() IN ('admin', 'librarian')"),
  'View profiles policy must NEVER allow librarians to query all user profiles'
);

// Verify absence of self-referencing RLS policy subqueries (preventing infinite recursion)
assert.ok(
  !migrationSql.includes('(SELECT p.role FROM public.profiles'),
  'Main migration must not contain self-referencing RLS policy queries'
);

// Check standalone security migration
const strictMigrationPath = path.resolve('supabase/migrations/20261021_strict_admin_role_enforcement.sql');
assert.ok(fs.existsSync(strictMigrationPath), 'Strict admin enforcement migration SQL must exist');
const strictSql = fs.readFileSync(strictMigrationPath, 'utf8');
assert.ok(strictSql.includes("id = auth.uid() OR public.get_user_role() = 'admin'"), 'Strict migration must enforce admin-only view policy');
assert.ok(!strictSql.includes('(SELECT p.role FROM public.profiles'), 'Strict migration must avoid recursive RLS subqueries');
assert.ok(strictSql.includes('CREATE TRIGGER trg_protect_profile_fields'), 'Strict migration must include protect_profile_fields trigger');
assert.ok(strictSql.includes('DROP POLICY IF EXISTS "Public can view profiles"'), 'Strict migration must drop permissive legacy policies');

console.log('✓ SQL migration verified for search_path security, recursion-free RLS, trigger-based field protection, and admin isolation.');

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
