export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'office_worker' | 'ground_worker';
  isActive: boolean;
  createdAt: string;
}

export interface Client {
  id: number;
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postalCode: string;
  phone?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  specialInstructions?: string;
  latitude?: number;
  longitude?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Job {
  id: number;
  clientId: number;
  assignedWorkerId?: number;
  title: string;
  description?: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
  durationMinutes: number;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled' | 'late';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
  client: {
    firstName: string;
    lastName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    postalCode: string;
    phone?: string;
    specialInstructions?: string;
    latitude?: number;
    longitude?: number;
  };
  worker?: {
    firstName: string;
    lastName: string;
    phone?: string;
  };
}

export interface Note {
  id: number;
  jobId: number;
  noteType: 'care_note' | 'internal_note' | 'incident_report';
  content: string;
  isPrivate: boolean;
  visibleToRoles: string[];
  createdAt: string;
  updatedAt: string;
  author: {
    firstName: string;
    lastName: string;
    role: string;
  };
}

export interface LocationLog {
  id: number;
  actionType: 'check_in' | 'check_out';
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: string;
  user: {
    firstName: string;
    lastName: string;
  };
}

export interface WorkerLocation {
  workerId: number;
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: string;
  actionType: 'check_in' | 'check_out';
  currentJob?: {
    title: string;
    clientName: string;
    address: string;
  };
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface CreateJobData {
  clientId: number;
  assignedWorkerId?: number;
  title: string;
  description?: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
  durationMinutes: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface UpdateJobData {
  assignedWorkerId?: number;
  title?: string;
  description?: string;
  scheduledStartTime?: string;
  scheduledEndTime?: string;
  durationMinutes?: number;
  status?: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled' | 'late';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export interface CreateNoteData {
  jobId: number;
  noteType: 'care_note' | 'internal_note' | 'incident_report';
  content: string;
  isPrivate: boolean;
  visibleToRoles?: string[];
}
