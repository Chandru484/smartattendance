import React, { useState } from 'react';
import { GraduationCap, Brain, Settings, Bell, BarChart3, Calendar, Loader } from 'lucide-react';
import { CameraView } from './components/CameraView';
import { StudentRegistry } from './components/StudentRegistry';
import { AttendanceDashboard } from './components/AttendanceDashboard';
import { SettingsPanel } from './components/SettingsPanel';
import { NotificationCenter } from './components/NotificationCenter';
import { ReportsView } from './components/ReportsView';
import { ScheduleView } from './components/ScheduleView';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useNotifications } from './hooks/useNotifications';
import { useDatabase } from './hooks/useDatabase';
import { Student, AttendanceRecord, AttendanceStats, AttendanceSettings } from './types';

function App() {
  const defaultSettings: AttendanceSettings = {
    autoMarkingEnabled: true,
    confidenceThreshold: 0.75,
    allowMultipleMarking: false,
    workingHours: { start: '09:00', end: '17:00' },
    notifications: { email: false, browser: true },
    backup: { autoBackup: true, frequency: 'daily' }
  };

  const [settings, setSettings] = useLocalStorage<AttendanceSettings>('settings', defaultSettings);
  const [activeTab, setActiveTab] = useState<'camera' | 'students' | 'dashboard' | 'reports' | 'schedule' | 'settings'>('camera');

  const { notifications, addNotification, markAsRead, clearAll } = useNotifications();

  const {
    students,
    records,
    loading,
    error,
    addStudent,
    removeStudent,
    toggleStudentStatus,
    addAttendanceRecord
  } = useDatabase();

  const handleAddStudent = async (studentData: Omit<Student, 'id' | 'registeredAt' | 'isActive'>) => {
    try {
      await addStudent(studentData);
      addNotification({
        type: 'success',
        title: 'Student Added',
        message: `${studentData.name} has been successfully registered.`
      });
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to add student. Please try again.'
      });
    }
  };

  const handleRemoveStudent = async (id: string) => {
    try {
      const student = students.find(s => s.id === id);
      await removeStudent(id);
      if (student) {
        addNotification({
          type: 'info',
          title: 'Student Removed',
          message: `${student.name} has been removed from the system.`
        });
      }
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to remove student. Please try again.'
      });
    }
  };

  const handleToggleStudentStatus = async (id: string) => {
    try {
      await toggleStudentStatus(id);
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update student status. Please try again.'
      });
    }
  };

  const handleAttendanceMarked = async (record: Omit<AttendanceRecord, 'id'>) => {
    const today = new Date().toDateString();
    const hasAttendedToday = records.some(r =>
      r.studentId === record.studentId &&
      r.timestamp && r.timestamp.toDateString() === today
    );

    if (!hasAttendedToday || settings.allowMultipleMarking) {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      const startTime = parseInt(settings.workingHours.start.split(':')[0]) * 60 + parseInt(settings.workingHours.start.split(':')[1]);
      const endTime = parseInt(settings.workingHours.end.split(':')[0]) * 60 + parseInt(settings.workingHours.end.split(':')[1]);

      try {
        await addAttendanceRecord(record);

        if (currentTime >= startTime && currentTime <= endTime) {
          addNotification({
            type: 'success',
            title: 'Attendance Marked',
            message: `${record.studentName} attendance recorded successfully.`
          });
        } else {
          addNotification({
            type: 'warning',
            title: 'Outside Working Hours',
            message: `Attendance marked for ${record.studentName} outside working hours.`
          });
        }
      } catch (err) {
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to mark attendance. Please try again.'
        });
      }
    } else {
      addNotification({
        type: 'warning',
        title: 'Already Marked',
        message: `${record.studentName} has already marked attendance today.`
      });
    }
  };

  // Calculate enhanced stats
  const calculateWeeklyStats = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
    
    return days.map((day, index) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);
      const dayRecords = records.filter(r => 
        r.timestamp && r.timestamp.toDateString() === date.toDateString()
      );
      return {
        day,
        present: new Set(dayRecords.map(r => r.studentId)).size,
        total: students.filter(s => s.isActive).length
      };
    });
  };

  const calculateMonthlyTrend = () => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const monthRecords = records.filter(r => 
        r.timestamp && r.timestamp >= monthStart && r.timestamp <= monthEnd
      );
      
      const uniqueDays = new Set(monthRecords.map(r => r.timestamp.toDateString())).size;
      const totalPossible = students.filter(s => s.isActive).length * uniqueDays;
      const rate = totalPossible > 0 ? (monthRecords.length / totalPossible) * 100 : 0;
      
      months.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        rate: Math.round(rate)
      });
    }
    return months;
  };

  const stats: AttendanceStats = {
    totalStudents: students.filter(s => s.isActive).length,
    presentToday: new Set(
      records
        .filter(r => r.timestamp && r.timestamp.toDateString() === new Date().toDateString())
        .map(r => r.studentId)
    ).size,
    attendanceRate: students.filter(s => s.isActive).length > 0 
      ? (new Set(
          records
            .filter(r => r.timestamp && r.timestamp.toDateString() === new Date().toDateString())
            .map(r => r.studentId)
        ).size / students.filter(s => s.isActive).length) * 100 
      : 0,
    recentRecords: records
      .filter(r => r.timestamp)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5),
    weeklyStats: calculateWeeklyStats(),
    monthlyTrend: calculateMonthlyTrend()
  };

  const tabs = [
    { id: 'camera' as const, label: 'Attendance', icon: Brain },
    { id: 'students' as const, label: 'Students', icon: GraduationCap },
    { id: 'dashboard' as const, label: 'Dashboard', icon: BarChart3 },
    { id: 'reports' as const, label: 'Reports', icon: BarChart3 },
    { id: 'schedule' as const, label: 'Schedule', icon: Calendar },
    { id: 'settings' as const, label: 'Settings', icon: Settings }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin mx-auto mb-4 text-blue-600" size={48} />
          <p className="text-gray-600 text-lg">Loading attendance system...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">!</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                <Brain className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Smart Attendance</h1>
                <p className="text-sm text-gray-600">Face Recognition System</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <NotificationCenter 
                notifications={notifications}
                onMarkAsRead={markAsRead}
                onClearAll={clearAll}
              />
              <div className="text-sm text-gray-600">
                <span className="font-medium">Today: {new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon size={20} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'camera' && (
          <CameraView 
            students={students.filter(s => s.isActive)}
            settings={settings}
            onAttendanceMarked={handleAttendanceMarked}
          />
        )}
        
        {activeTab === 'students' && (
          <StudentRegistry
            students={students}
            onAddStudent={handleAddStudent}
            onRemoveStudent={handleRemoveStudent}
            onToggleStatus={handleToggleStudentStatus}
          />
        )}
        
        {activeTab === 'dashboard' && (
          <AttendanceDashboard
            records={records}
            students={students}
            stats={stats}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView
            records={records}
            students={students}
            stats={stats}
          />
        )}

        {activeTab === 'schedule' && (
          <ScheduleView
            students={students}
            records={records}
          />
        )}
        
        {activeTab === 'settings' && (
          <SettingsPanel
            settings={settings}
            onUpdateSettings={setSettings}
          />
        )}
      </main>
    </div>
  );
}

export default App;