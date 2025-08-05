import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth';
import { auth } from './firebase';
import { FirebaseCollections, User, UserRole } from './firebase-collections';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  image?: string;
}

export class FirebaseAuthService {
  // Sign up with email and password
  static async signUp(email: string, password: string, name: string, role: UserRole = 'FOUNDER'): Promise<AuthUser> {
    try {
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Update the user's display name
      await updateProfile(firebaseUser, { displayName: name });

      // Create user document in Firestore
      const userData: Omit<User, 'id'> = {
        email: firebaseUser.email!,
        name,
        role,
        bio: '',
        skills: [],
        openToTeam: false,
        emailVerified: firebaseUser.emailVerified ? new Date() : undefined,
        image: firebaseUser.photoURL || undefined,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Use the Firebase Auth UID as the document ID for consistency
      await FirebaseCollections.createUser({ ...userData, id: firebaseUser.uid });

      return {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        name,
        role
      };
    } catch (error: any) {
      console.error('Error signing up:', error);
      throw new Error(error.message || 'Failed to create account');
    }
  }

  // Sign in with email and password
  static async signIn(email: string, password: string): Promise<AuthUser> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Get user data from Firestore
      const userData = await FirebaseCollections.getUserById(firebaseUser.uid);

      if (!userData) {
        throw new Error('User data not found');
      }

      return {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        name: userData.name,
        role: userData.role,
        image: userData.image
      };
    } catch (error: any) {
      console.error('Error signing in:', error);
      throw new Error(error.message || 'Failed to sign in');
    }
  }

  // Sign out
  static async signOutUser(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error('Error signing out:', error);
      throw new Error(error.message || 'Failed to sign out');
    }
  }

  // Get current user
  static getCurrentUser(): Promise<AuthUser | null> {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        unsubscribe();

        if (firebaseUser) {
          try {
            const userData = await FirebaseCollections.getUserById(firebaseUser.uid);

            if (userData) {
              resolve({
                id: firebaseUser.uid,
                email: firebaseUser.email!,
                name: userData.name,
                role: userData.role,
                image: userData.image
              });
            } else {
              resolve(null);
            }
          } catch (error) {
            console.error('Error getting user data:', error);
            resolve(null);
          }
        } else {
          resolve(null);
        }
      });
    });
  }

  // Listen to auth state changes
  static onAuthStateChange(callback: (user: AuthUser | null) => void): () => void {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userData = await FirebaseCollections.getUserById(firebaseUser.uid);

          if (userData) {
            callback({
              id: firebaseUser.uid,
              email: firebaseUser.email!,
              name: userData.name,
              role: userData.role,
              image: userData.image
            });
          } else {
            callback(null);
          }
        } catch (error) {
          console.error('Error getting user data:', error);
          callback(null);
        }
      } else {
        callback(null);
      }
    });
  }
} 