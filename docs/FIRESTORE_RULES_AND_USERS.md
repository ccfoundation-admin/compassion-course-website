# Firestore rules and users collection

## Team Management "Missing or insufficient permissions"

The app uses the **users** collection for profiles. If you see permission errors on Team Management (or when loading your profile), the Firestore rules in your Firebase project may not yet include the **users** collection.

### 1. Deploy Firestore rules

From the project root, with Firebase CLI logged in and with permission to deploy rules:

```bash
firebase deploy --only firestore:rules
```

If you get `403, The caller does not have permission`, log in with an account that has Firebase Rules deploy access (e.g. Owner or a role with `firebaserules.releases.create`):

```bash
firebase login
```

Then run the deploy again. The rules in `firestore.rules` include `match /users/{userId}` so that authenticated users can read/write their own profile and admins can read/write all.

### 2. Profile data in the users collection

After deploying, the app reads and writes the **users** collection. If your profile data was previously only in **userProfiles**:

- **Option A – Migrate data:** In Firebase Console → Firestore, copy (or export/import) documents from the **userProfiles** collection into a new **users** collection, keeping the same document IDs (user UIDs).
- **Option B – New project / no legacy data:** If you are starting fresh, new sign-ups and the "Create user" admin flow will create documents in **users**; no migration needed.

Once rules are deployed and profile data exists in **users** (if needed), Team Management and profile loading should work without permission errors.
