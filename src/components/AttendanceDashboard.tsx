import React from 'react';
import { BarChart3, Download, Calendar, TrendingUp, Clock, Users, Eye } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { AttendanceRecord, AttendanceStats, Student } from '../types';
import { exportToCSV, exportDetailedReport } from '../utils/faceRecognition';

interface AttendanceDashboardProps {
  records: AttendanceRecord[];
  students: Student[];
  stats: AttendanceStats;
}

export const AttendanceDashboard: React.FC<AttendanceDashboardProps> = ({ records, students, stats }) => {
  const handleExportCSV = () => {
    exportToCSV(records);
  };

  const handleExportDetailed = () => {
    exportDetailedReport(records, students);
  };

  const todayRecords = records.filter(record => 
    record.timestamp.toDateString() === new Date().toDateString()
  );

  const getAttendanceColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600 bg-green-100';
    if (rate >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Students</p>
              <p className="text-3xl font-bold">{stats.totalStudents}</p>
            </div>
            <Users size={32} className="text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Present Today</p>
              <p className="text-3xl font-bold">{stats.presentToday}</p>
            </div>
            <Calendar size={32} className="text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Attendance Rate</p>
              <p className="text-3xl font-bold">{stats.attendanceRate.toFixed(1)}%</p>
            </div>
            <TrendingUp size={32} className="text-orange-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Total Records</p>
              <p className="text-3xl font-bold">{records.length}</p>
            </div>
            <BarChart3 size={32} className="text-purple-200" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Weekly Attendance Chart */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Weekly Attendance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.weeklyStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="present" fill="#3B82F6" name="Present" />
              <Bar dataKey="total" fill="#E5E7EB" name="Total" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Trend Chart */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Monthly Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="rate" 
                stroke="#10B981" 
                strokeWidth={3}
                name="Attendance Rate (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity & Today's Records */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Eye className="text-blue-600" size={24} />
            Recent Activity
          </h3>
          <div className="space-y-3">
            {stats.recentRecords.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No recent activity</p>
            ) : (
              stats.recentRecords.map((record) => (
                <div key={record.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {record.studentName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 text-sm">{record.studentName}</p>
                    <p className="text-xs text-gray-500">
                      {record.timestamp.toLocaleDateString()} at {record.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    record.confidence >= 0.8 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {(record.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Today's Records */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <Clock className="text-blue-600" size={28} />
              Today's Attendance
            </h2>
            <div className="flex gap-2">
              <button
                onClick={handleExportCSV}
                disabled={records.length === 0}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors text-sm"
              >
                <Download size={16} />
                CSV
              </button>
              <button
                onClick={handleExportDetailed}
                disabled={records.length === 0}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors text-sm"
              >
                <Download size={16} />
                Detailed
              </button>
            </div>
          </div>

          {todayRecords.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Clock size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No attendance records today</p>
              <p className="text-sm">Records will appear here when students mark attendance</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 pr-4 font-semibold text-gray-700">Student</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Time</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Confidence</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Location</th>
                    <th className="text-left py-3 pl-4 font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {todayRecords.map((record) => (
                    <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {record.studentName.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-800">{record.studentName}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {record.timestamp.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          record.confidence >= 0.8 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {(record.confidence * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-600 text-sm">
                        {record.location || 'Main Campus'}
                      </td>
                      <td className="py-4 pl-4">
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                          Present
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};