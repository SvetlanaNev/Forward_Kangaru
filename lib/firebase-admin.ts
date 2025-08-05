import admin from 'firebase-admin';

// Initialize Firebase Admin
if (!admin.apps.length && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: "forward-2e9b1",
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    } as admin.ServiceAccount),
    projectId: "forward-2e9b1",
  });
}

// Create dummy implementations for build time if credentials are missing
const createMockAdmin = () => ({
  verifyIdToken: async () => ({ uid: 'mock-user' }),
});

const createMockFirestore = () => ({
  collection: () => ({
    doc: () => ({
      get: async () => ({ exists: false }),
      set: async () => {},
    }),
  }),
});

export const adminDb = admin.apps.length > 0 ? admin.firestore() : createMockFirestore();
export const adminAuth = admin.apps.length > 0 ? admin.auth() : createMockAdmin();

export default admin; 