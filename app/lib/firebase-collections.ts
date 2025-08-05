import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  setDoc,
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  PROJECTS: 'projects',
  DAILY_UPDATES: 'dailyUpdates',
  COMMENTS: 'comments',
  AVAILABILITY_SLOTS: 'availabilitySlots',
  BOOKED_SESSIONS: 'bookedSessions',
  SESSION_ATTENDEES: 'sessionAttendees',
  TEAM_MEMBERSHIPS: 'teamMemberships'
} as const;

// Types (matching Prisma schema)
export type UserRole = 'FOUNDER' | 'EXPERT' | 'TEAM_MEMBER';
export type ProjectStatus = 'ACTIVE' | 'COMPLETED' | 'PAUSED';
export type SessionStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type AttendeeStatus = 'INVITED' | 'ACCEPTED' | 'DECLINED' | 'JOINED' | 'LEFT';

export interface User {
  id?: string;
  name?: string;
  email: string;
  emailVerified?: Date;
  image?: string;
  password?: string;
  role: UserRole;
  bio?: string;
  skills: string[];
  openToTeam: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id?: string;
  name: string;
  description: string;
  pointA: string;
  pointB: string;
  status: ProjectStatus;
  openToTeamMembers: boolean;
  startDate: Date;
  endDate?: Date;
  founderId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DailyUpdate {
  id?: string;
  projectId: string;
  userId: string;
  day: number;
  date: Date;
  wantToDoToday?: string;
  whatDid?: string;
  challenges?: string;
  nextSteps?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id?: string;
  content: string;
  projectId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AvailabilitySlot {
  id?: string;
  userId: string;
  title: string;
  startTime: Date;
  endTime: Date;
  isRecurring: boolean;
  maxBookings: number;
  description?: string;
  meetingLink?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookedSession {
  id?: string;
  availabilitySlotId: string;
  bookedByUserId: string;
  projectId?: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  meetingLink?: string;
  status: SessionStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionAttendee {
  id?: string;
  sessionId: string;
  userId: string;
  status: AttendeeStatus;
  joinedAt?: Date;
  leftAt?: Date;
  createdAt: Date;
}

export interface TeamMembership {
  id?: string;
  userId: string;
  projectId: string;
  role: string;
  joinedAt: Date;
}

// Helper functions for common operations
export const FirebaseCollections = {
  // Users
  async createUser(userData: User): Promise<string> {
    if (userData.id) {
      // Create with specific ID
      const docRef = doc(db, COLLECTIONS.USERS, userData.id);
      await setDoc(docRef, {
        ...userData,
        createdAt: Timestamp.fromDate(userData.createdAt),
        updatedAt: Timestamp.fromDate(userData.updatedAt),
      });
      return userData.id;
    } else {
      // Create with auto-generated ID
      const docRef = await addDoc(collection(db, COLLECTIONS.USERS), {
        ...userData,
        createdAt: Timestamp.fromDate(userData.createdAt),
        updatedAt: Timestamp.fromDate(userData.updatedAt),
      });
      return docRef.id;
    }
  },

  async getUserById(id: string): Promise<User | null> {
    const docRef = doc(db, COLLECTIONS.USERS, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt.toDate(),
        updatedAt: docSnap.data().updatedAt.toDate(),
      } as User;
    }
    return null;
  },

  async getUserByEmail(email: string): Promise<User | null> {
    const q = query(collection(db, COLLECTIONS.USERS), where('email', '==', email));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate(),
      } as User;
    }
    return null;
  },

  async getAllUsers(): Promise<User[]> {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.USERS));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
    })) as User[];
  },

  async getUsersByRole(role: UserRole): Promise<User[]> {
    const q = query(collection(db, COLLECTIONS.USERS), where('role', '==', role));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
    })) as User[];
  },

  // Projects
  async createProject(projectData: Omit<Project, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.PROJECTS), {
      ...projectData,
      startDate: Timestamp.fromDate(projectData.startDate),
      endDate: projectData.endDate ? Timestamp.fromDate(projectData.endDate) : null,
      createdAt: Timestamp.fromDate(projectData.createdAt),
      updatedAt: Timestamp.fromDate(projectData.updatedAt),
    });
    return docRef.id;
  },

  async getAllProjects(): Promise<Project[]> {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.PROJECTS));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      startDate: doc.data().startDate.toDate(),
      endDate: doc.data().endDate?.toDate() || null,
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
    })) as Project[];
  },

  async getProjectById(id: string): Promise<Project | null> {
    const docRef = doc(db, COLLECTIONS.PROJECTS, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        startDate: docSnap.data().startDate.toDate(),
        endDate: docSnap.data().endDate?.toDate() || null,
        createdAt: docSnap.data().createdAt.toDate(),
        updatedAt: docSnap.data().updatedAt.toDate(),
      } as Project;
    }
    return null;
  },

  // Daily Updates
  async createDailyUpdate(updateData: Omit<DailyUpdate, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.DAILY_UPDATES), {
      ...updateData,
      date: Timestamp.fromDate(updateData.date),
      createdAt: Timestamp.fromDate(updateData.createdAt),
      updatedAt: Timestamp.fromDate(updateData.updatedAt),
    });
    return docRef.id;
  },

  async getDailyUpdatesByProject(projectId: string): Promise<DailyUpdate[]> {
    const q = query(
      collection(db, COLLECTIONS.DAILY_UPDATES),
      where('projectId', '==', projectId),
      orderBy('day', 'asc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
    })) as DailyUpdate[];
  },

  // Comments
  async createComment(commentData: Omit<Comment, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.COMMENTS), {
      ...commentData,
      createdAt: Timestamp.fromDate(commentData.createdAt),
      updatedAt: Timestamp.fromDate(commentData.updatedAt),
    });
    return docRef.id;
  },

  async getCommentsByProject(projectId: string): Promise<Comment[]> {
    const q = query(
      collection(db, COLLECTIONS.COMMENTS),
      where('projectId', '==', projectId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
    })) as Comment[];
  },

  // Availability Slots
  async createAvailabilitySlot(slotData: Omit<AvailabilitySlot, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.AVAILABILITY_SLOTS), {
      ...slotData,
      startTime: Timestamp.fromDate(slotData.startTime),
      endTime: Timestamp.fromDate(slotData.endTime),
      createdAt: Timestamp.fromDate(slotData.createdAt),
      updatedAt: Timestamp.fromDate(slotData.updatedAt),
    });
    return docRef.id;
  },

  async getAvailabilitySlots(): Promise<AvailabilitySlot[]> {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.AVAILABILITY_SLOTS));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      startTime: doc.data().startTime.toDate(),
      endTime: doc.data().endTime.toDate(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
    })) as AvailabilitySlot[];
  },

  // Booked Sessions
  async createBookedSession(sessionData: Omit<BookedSession, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.BOOKED_SESSIONS), {
      ...sessionData,
      startTime: Timestamp.fromDate(sessionData.startTime),
      endTime: Timestamp.fromDate(sessionData.endTime),
      createdAt: Timestamp.fromDate(sessionData.createdAt),
      updatedAt: Timestamp.fromDate(sessionData.updatedAt),
    });
    return docRef.id;
  },

  async getBookedSessions(): Promise<BookedSession[]> {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.BOOKED_SESSIONS));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      startTime: doc.data().startTime.toDate(),
      endTime: doc.data().endTime.toDate(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
    })) as BookedSession[];
  }
}; 