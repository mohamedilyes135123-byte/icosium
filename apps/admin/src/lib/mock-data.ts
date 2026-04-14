export type Role = 'PATIENT' | 'DOCTOR' | 'PHARMACY' | 'LAB' | 'ADMIN';

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
  wilaya: string;
};

export type DoctorInfo = User & {
  role: 'DOCTOR';
  specialty: string;
  fees: number;
  rating: number;
  address: string;
  clinicName: string;
};

export type MedicalRequestStatus = 'PENDING' | 'IN_PROGRESS' | 'LAB_ORDERED' | 'PRESCRIBED' | 'COMPLETED';

export type MedicalRequest = {
  id: string;
  patientId: string;
  doctorId: string;
  status: MedicalRequestStatus;
  date: string;
  symptoms: string;
  isFirstVisit: boolean;
};

// --- Mock Data ---

export const mockUsers: Record<string, User | DoctorInfo> = {
  'user-1': {
    id: 'user-1',
    name: 'أحمد بن علي', // Patient
    email: 'ahmed@example.com',
    role: 'PATIENT',
    wilaya: '16',
  },
  'doc-1': {
    id: 'doc-1',
    name: 'د. يوسف خليل',
    email: 'yousef@care.com',
    role: 'DOCTOR',
    specialty: 'طبيب عام',
    fees: 1500,
    rating: 4.8,
    address: 'شارع ديدوش مراد',
    clinicName: 'عيادة الشفاء',
    wilaya: '16',
  },
  'doc-2': {
    id: 'doc-2',
    name: 'د. سارة بوعلام',
    email: 'sarah@care.com',
    role: 'DOCTOR',
    specialty: 'طبيب أطفال',
    fees: 2000,
    rating: 4.9,
    address: 'حي الياسمين',
    clinicName: 'عيادة الأمل',
    wilaya: '31',
  },
  'pharm-1': {
    id: 'pharm-1',
    name: 'صيدلية النور',
    email: 'pharm@example.com',
    role: 'PHARMACY',
    wilaya: '16',
  },
  'lab-1': {
    id: 'lab-1',
    name: 'مخبر التحاليل الطبية الدقيقة',
    email: 'lab@example.com',
    role: 'LAB',
    wilaya: '16',
  },
  'admin-1': {
    id: 'admin-1',
    name: 'الإدارة المركزية',
    email: 'admin@3inaya.dz',
    role: 'ADMIN',
    wilaya: '16',
  }
};

export const mockDoctors = Object.values(mockUsers).filter(u => u.role === 'DOCTOR') as DoctorInfo[];

export const mockRequests: MedicalRequest[] = [
  {
    id: 'req-1',
    patientId: 'user-1',
    doctorId: 'doc-1',
    status: 'IN_PROGRESS',
    date: '2026-04-12T10:00:00Z',
    symptoms: 'حمى سعال وصداع مستمر منذ يومين',
    isFirstVisit: false
  }
];
