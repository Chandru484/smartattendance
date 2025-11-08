export interface Student {
  id: string;
  name: string;
  email: string;
  studentId?: string;
  department?: string;
  year?: string;
  photo?: string;
  registeredAt: Date;
  isActive: boolean;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  timestamp: Date;
  confidence: number;
  photo?: string;
  location?: string;
  deviceInfo?: string;
}

export interface AttendanceStats {
  totalStudents: number;
  presentToday: number;
  attendanceRate: number;
  recentRecords: AttendanceRecord[];
  weeklyStats: { day: string; present: number; total: number }[];
  monthlyTrend: { month: string; rate: number }[];
}

export interface AttendanceSettings {
  autoMarkingEnabled: boolean;
  confidenceThreshold: number;
  allowMultipleMarking: boolean;
  workingHours: {
    start: string;
    end: string;
  };
  notifications: {
    email: boolean;
    browser: boolean;
  };
  backup: {
    autoBackup: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
  };
}

export interface NotificationMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}