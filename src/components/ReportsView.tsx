import React, { useState } from 'react';
import { BarChart3, Calendar, Download, Filter, TrendingUp, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AttendanceRecord, AttendanceStats, Student } from '../types';
import { exportDetailedReport, generateAttendanceReport } from '../utils/faceRecognition';

interface ReportsViewProps {
  records: AttendanceRecord[];
  students: Student[];
  stats: AttendanceStats;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ records, students, stats }) => {
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedStudent, setSelectedStudent] = useState<string>('all');

  const getFilteredRecords = () => {
    const now = new Date();
    let startDate = new Date();

    switch (dateRange) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    return records.filter(record => {
      const recordDate = new Date(record.timestamp);
      const matchesDate = recordDate >= startDate;
      const matchesStudent = selectedStudent === 'all' || record.studentId === selectedStudent;
      return matchesDate && matchesStudent;
    });
  };

  const generateDepartmentStats = () => {
    const departmentMap = new Map<string, { total: number; present: number }>();
    
    students.forEach(student => {
      const dept = student.department || 'Unassigned';
      if (!departmentMap.has(dept)) {
        departmentMap.set(dept, { total: 0, present: 0 });
      }
      departmentMap.get(dept)!.total++;
    });

    const filteredRecords = getFilteredRecords();
    filteredRecords.forEach(record => {
      const student = students.find(s => s.id === record.studentId);
      const dept = student?.department || 'Unassigned';
      if (departmentMap.has(dept)) {
        departmentMap.get(dept)!.present++;
      }
    });

    return Array.from(departmentMap.entries()).map(([name, data]) => ({
      name,
      total: data.total,
      present: data.present,
      rate: data.total > 0 ? Math.round((data.present / data.total) * 100) : 0
    }));
  };

  const generateTimeDistribution = () => {
    const filteredRecords = getFilteredRecords();
    const hourMap = new Map<number, number>();

    filteredRecords.forEach(record => {
      const hour = new Date(record.timestamp).getHours();
      hourMap.set(hour, (hourMap.get(hour) || 0) + 1);
    });

    return Array.from(hourMap.entries())
      .map(([hour, count]) => ({
        hour: `${hour}:00`,
        count
      }))
      .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));
  };

  const departmentStats = generateDepartmentStats();
  const timeDistribution = generateTimeDistribution();
  const filteredRecords = getFilteredRecords();

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  const handleExportReport = () => {
    generateAttendanceReport(filteredRecords, students, dateRange);
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <BarChart3 className="text-blue-600" size={28} />
            Attendance Reports
          </h2>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="text-gray-400" size={20} />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="quarter">Last Quarter</option>
                <option value="year">Last Year</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="text-gray-400" size={20} />
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Students</option>
                {students.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleExportReport}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Download size={18} />
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Records</p>
              <p className="text-3xl font-bold">{filteredRecords.length}</p>
            </div>
            <BarChart3 size={32} className="text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Unique Students</p>
              <p className="text-3xl font-bold">
                {new Set(filteredRecords.map(r => r.studentId)).size}
              </p>
            </div>
            <Users size={32} className="text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Avg. Confidence</p>
              <p className="text-3xl font-bold">
                {filteredRecords.length > 0 
                  ? Math.round(filteredRecords.reduce((sum, r) => sum + r.confidence, 0) / filteredRecords.length * 100)
                  : 0}%
              </p>
            </div>
            <TrendingUp size={32} className="text-orange-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Peak Hour</p>
              <p className="text-3xl font-bold">
                {timeDistribution.length > 0 
                  ? timeDistribution.reduce((max, curr) => curr.count > max.count ? curr : max).hour
                  : 'N/A'}
              </p>
            </div>
            <Calendar size={32} className="text-purple-200" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Department Performance */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Department Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="rate" fill="#3B82F6" name="Attendance Rate (%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Time Distribution */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Attendance by Hour</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={timeDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#10B981" name="Check-ins" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Department Breakdown */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Department Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 pr-4 font-semibold text-gray-700">Department</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Total Students</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Records</th>
                  <th className="text-left py-3 pl-4 font-semibold text-gray-700">Rate</th>
                </tr>
              </thead>
              <tbody>
                {departmentStats.map((dept) => (
                  <tr key={dept.name} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 pr-4 font-medium text-gray-800">{dept.name}</td>
                    <td className="py-4 px-4 text-gray-600">{dept.total}</td>
                    <td className="py-4 px-4 text-gray-600">{dept.present}</td>
                    <td className="py-4 pl-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        dept.rate >= 80 
                          ? 'bg-green-100 text-green-800'
                          : dept.rate >= 60
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {dept.rate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Department Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={departmentStats}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="total"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {departmentStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};