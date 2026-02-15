const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

initializeApp();

const TEMP_PASSWORD = "12341234";

/**
 * Callable: createUserByAdmin
 * Only callable by authenticated admins (Firestore admins collection).
 * Creates a Firebase Auth user with temporary password and a userProfiles document with mustChangePassword: true.
 */
exports.createUserByAdmin = onCall(
  { region: "us-central1" },
  async (request) => {
    if (!request.auth?.uid) {
      throw new HttpsError("unauthenticated", "Sign-in required.");
    }
    const callerUid = request.auth.uid;
    const data = request.data;
    if (!data || typeof data !== "object") {
      throw new HttpsError("invalid-argument", "Missing data.");
    }
    const newEmail = typeof data.email === "string" ? data.email.trim() : "";
    const name = typeof data.name === "string" ? data.name.trim() : "";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!newEmail || !emailRegex.test(newEmail)) {
      throw new HttpsError("invalid-argument", "A valid email is required.");
    }
    const db = getFirestore();
    const callerEmail = request.auth.token?.email ? String(request.auth.token.email).toLowerCase().trim() : "";
    const adminByUid = db.collection("admins").doc(callerUid);
    const adminByEmail = db.collection("admins").doc(callerEmail);
    const [snapUid, snapEmail] = await Promise.all([
      adminByUid.get(),
      adminByEmail.get(),
    ]);
    if (!snapUid.exists && !snapEmail.exists) {
      throw new HttpsError("permission-denied", "Admin only.");
    }
    const normalizedNewEmail = newEmail.toLowerCase();
    const auth = getAuth();
    try {
      await auth.getUserByEmail(normalizedNewEmail);
      throw new HttpsError("already-exists", "A user with this email already exists.");
    } catch (e) {
      if (e instanceof HttpsError) throw e;
      const code = e.code || (e.errorInfo && e.errorInfo.code);
      if (code !== "auth/user-not-found") {
        throw new HttpsError("internal", e.message || "Failed to check user.");
      }
    }
    let userRecord;
    try {
      userRecord = await auth.createUser({
        email: normalizedNewEmail,
        password: TEMP_PASSWORD,
        displayName: name || undefined,
        emailVerified: false,
      });
    } catch (e) {
      throw new HttpsError("internal", e.message || "Failed to create user.");
    }
    const now = FieldValue.serverTimestamp();
    await db.collection("userProfiles").doc(userRecord.uid).set({
      email: normalizedNewEmail,
      name: name || "",
      organizations: [],
      role: "viewer",
      mustChangePassword: true,
      createdAt: now,
      updatedAt: now,
    });
    return {
      ok: true,
      uid: userRecord.uid,
      email: normalizedNewEmail,
      temporaryPassword: TEMP_PASSWORD,
    };
  }
);
