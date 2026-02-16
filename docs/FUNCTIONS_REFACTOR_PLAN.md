# Functions refactor plan

Refactor `functions/index.js` to reduce duplication and centralize admin-check and error-logging logic.

---

## 1. Shared admin-check helper

**Goal:** One place that enforces “caller is an active admin” so all callables stay in sync.

**Add** (near top of `functions/index.js`, after constants):

- **`assertCallerIsActiveAdmin(callerUid)`**  
  - If `!callerUid` → `throw new HttpsError('unauthenticated', 'sign in required')`.
  - `const adminSnap = await db.collection('admins').doc(callerUid).get()`.
  - If `!adminSnap.exists` → `throw new HttpsError('permission-denied', 'admin doc missing')`.
  - Read `role` and `status` from `adminSnap.data()`.
  - Require `role` in `['admin','superAdmin']` else `throw new HttpsError('permission-denied', 'admin role required')`.
  - Require `status` in `['active','approved']` else `throw new HttpsError('permission-denied', 'admin not active or approved')`.
  - Return `void` (or optionally return `adminSnap` if callers need it).

**Use it in:**

- **createUserByAdminLogic**  
  Replace the block from “Require caller.uid” through the role/status checks with a single call:  
  `assertCallerIsActiveAdmin(caller?.uid);`  
  (Keep the earlier `caller?.uid` check or fold it into the helper; either way, unauthenticated must throw before any Firestore read.)
- **approveUser**  
  Replace the “get admins by uid/email and check exists” + role/status logic with:  
  `assertCallerIsActiveAdmin(callerUid);`.
- **grantAdmin**  
  Same: replace local admin doc fetch + role/status checks with `assertCallerIsActiveAdmin(callerUid)`.
- **revokeAdmin**  
  Same: replace local admin doc fetch + role/status checks with `assertCallerIsActiveAdmin(callerUid)`.

**Note:** `approveUser` currently allows admin by **uid or email** (checks both `admins/{callerUid}` and `admins/{callerEmail}`). Decide:

- **Option A:** Change to uid-only and use `assertCallerIsActiveAdmin(callerUid)` (simplest, consistent with other callables).
- **Option B:** Keep email fallback: implement a separate `assertCallerIsActiveAdminByUidOrEmail(callerUid, callerEmail)` that tries both docs and applies the same role/status rules, and use that only in `approveUser`.

Recommendation: **Option A** unless you have a stated need for email-based admin lookup.

---

## 2. Internal error-logging helper (createUserByAdminLogic)

**Goal:** One pattern for “log raw error and throw HttpsError('internal', ...)” so adding steps doesn’t duplicate code.

**Add** (inside `functions/index.js`, e.g. just before `createUserByAdminLogic`):

- **`function logAndThrowInternal(step, e, message)`**  
  - `console.error('[createUserByAdmin]', { step, err: e, message: e?.message, code: e?.code, stack: e?.stack })`.
  - `throw new HttpsError('internal', message || e?.message || 'unknown')`.

**Use it in createUserByAdminLogic:**

- In every internal `catch (e)` that currently does both `console.error(...)` and `throw new HttpsError('internal', ...)`, replace with a single call, e.g.:
  - `auth.getUserByEmail` catch: `logAndThrowInternal(step, e, 'getUserByEmail failed: ' + (e?.message || 'unknown'))`.
  - `auth.createUser` catch: `logAndThrowInternal(step, e, 'createUser failed: ' + (e?.message || 'unknown'))`.
  - `firestore.write.users` catch: `logAndThrowInternal(step, e, 'firestore write failed: ' + (e?.message || 'unknown'))`.
  - `firestore.write.userProfiles` catch: same.
- In the **outer** catch of `createUserByAdminLogic`, keep the existing behavior (if HttpsError rethrow; else log and throw with `createUserByAdmin failed at ${step}: ...`). You can optionally call `logAndThrowInternal(step, e, \`createUserByAdmin failed at ${step}: ${e?.message || 'unknown'}\`)` there for consistency, as long as the thrown message still includes `step`.

---

## 3. Order of operations

1. Add **`assertCallerIsActiveAdmin(callerUid)`** and wire it into **createUserByAdminLogic** (remove duplicated admin-check block).
2. Wire **assertCallerIsActiveAdmin** into **grantAdmin** and **revokeAdmin** (straight replacement).
3. Decide uid-only vs email fallback for **approveUser**; then replace its admin check with the chosen helper (or keep current logic if you leave email fallback as-is).
4. Add **`logAndThrowInternal(step, e, message)`** and replace the four internal catch blocks in **createUserByAdminLogic** to use it.
5. Run existing flows (e.g. Add User, approve user, grant/revoke admin) and confirm behavior is unchanged.
6. Deploy: `firebase deploy --only functions` (or only the affected callables if you prefer).

---

## 4. Out of scope (for later)

- Moving to TypeScript or multiple files (e.g. `functions/src/...`).
- Extracting constants (admin roles, statuses) into a separate module.
- Adding unit tests for the new helpers.

These can be done in a follow-up if you want to go further.
